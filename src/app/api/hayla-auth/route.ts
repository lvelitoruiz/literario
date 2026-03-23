import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  const from = (formData.get("from") as string) || "/categoria/hayla";

  const expectedRaw = process.env.HAYLA_PASSWORD;
  const expected =
    typeof expectedRaw === "string"
      ? expectedRaw.replace(/^['"]|['"]$/g, "")
      : undefined;
  const provided =
    typeof password === "string" ? password.trim() : undefined;

  if (!expected) {
    return new NextResponse("HAYLA_PASSWORD no está configurada.", {
      status: 500,
    });
  }

  if (!provided || provided !== expected) {
    const url = new URL("/hayla-acceso", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("from", from);
    return NextResponse.redirect(url);
  }

  const redirectUrl = new URL(from, request.url);

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("hayla_auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  return response;
}

