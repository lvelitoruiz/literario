import { type NextRequest, NextResponse } from "next/server";

// Callback del OAuth de GitHub para Decap CMS.
// Recibe ?code=...&state=..., intercambia el code por un access_token y
// devuelve un HTML que llama a window.opener.postMessage() con el token,
// que es como Decap CMS espera recibirlo.

export const runtime = "nodejs";

function html(payload: {
  status: "success" | "error";
  token?: string;
  message?: string;
}) {
  // Decap escucha mensajes con el formato:
  //   "authorization:github:<status>:<JSON.stringify(content)>"
  const content = payload.status === "success"
    ? JSON.stringify({ token: payload.token, provider: "github" })
    : JSON.stringify({ message: payload.message ?? "Error desconocido" });

  const message = `authorization:github:${payload.status}:${content}`;

  return `<!DOCTYPE html>
<html>
  <head>
    <title>Autenticando…</title>
    <meta charset="utf-8" />
  </head>
  <body style="font-family: system-ui; padding: 2rem; color: #111;">
    <p>${payload.status === "success" ? "Autenticado. Ya puedes cerrar esta ventana." : `Error: ${payload.message ?? ""}`}</p>
    <script>
      (function() {
        var message = ${JSON.stringify(message)};
        function send() {
          if (!window.opener) return;
          window.opener.postMessage(message, "*");
        }
        // Decap hace handshake: primero "authorizing:github" → respondemos con el message
        window.addEventListener("message", function (e) {
          if (e.data === "authorizing:github") {
            send();
          }
        }, false);
        // Y por si acaso, lo enviamos también de inmediato
        send();
      })();
    </script>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      html({
        status: "error",
        message:
          "OAUTH_GITHUB_CLIENT_ID / OAUTH_GITHUB_CLIENT_SECRET no configurados.",
      }),
      { status: 500, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return new NextResponse(
      html({ status: "error", message: "Falta el parámetro `code`." }),
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const expectedState = request.cookies.get("decap_oauth_state")?.value;
  if (!expectedState || state !== expectedState) {
    return new NextResponse(
      html({ status: "error", message: "State inválido (posible CSRF)." }),
      { status: 400, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return new NextResponse(
      html({
        status: "error",
        message: `GitHub respondió ${tokenRes.status}`,
      }),
      { status: 502, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!tokenJson.access_token) {
    return new NextResponse(
      html({
        status: "error",
        message:
          tokenJson.error_description ?? tokenJson.error ?? "Sin access_token",
      }),
      { status: 401, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  // Allowlist opcional: si OAUTH_ALLOWED_USERS está definido (lista separada
  // por comas con usernames de GitHub), solo esos usuarios pueden acceder al
  // CMS. Si la variable está vacía, no se aplica ningún filtro (cualquiera
  // que tenga acceso al repo en GitHub puede entrar).
  const allowedUsers = (process.env.OAUTH_ALLOWED_USERS ?? "")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean);

  if (allowedUsers.length > 0) {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "User-Agent": "decap-cms-auth",
        Accept: "application/vnd.github+json",
      },
    });

    if (!userRes.ok) {
      return new NextResponse(
        html({
          status: "error",
          message: `No se pudo verificar el usuario en GitHub (${userRes.status}).`,
        }),
        {
          status: 502,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      );
    }

    const userJson = (await userRes.json()) as { login?: string };
    const login = userJson.login?.toLowerCase();

    if (!login || !allowedUsers.includes(login)) {
      return new NextResponse(
        html({
          status: "error",
          message: `Usuario "${userJson.login ?? "?"}" no autorizado para editar este sitio.`,
        }),
        {
          status: 403,
          headers: { "content-type": "text/html; charset=utf-8" },
        },
      );
    }
  }

  const response = new NextResponse(
    html({ status: "success", token: tokenJson.access_token }),
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
  response.cookies.delete("decap_oauth_state");
  return response;
}
