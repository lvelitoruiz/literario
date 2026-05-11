import { type NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

// Inicia el flow OAuth de GitHub para Decap CMS.
// Decap abre /api/auth?provider=github&site_id=… y espera ser redirigido
// a https://github.com/login/oauth/authorize?...
//
// Cuando GitHub redirige de vuelta a /api/auth/callback, ese handler
// intercambia el code por un access_token y se lo postMessage-a a la
// ventana de Decap (window.opener).

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error: "OAUTH_GITHUB_CLIENT_ID no está configurado en el servidor.",
      },
      { status: 500 },
    );
  }

  const state = randomBytes(16).toString("hex");

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/callback`;

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", "repo,user");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  // CSRF: el callback compara este valor contra el state que devuelve GitHub
  response.cookies.set("decap_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
