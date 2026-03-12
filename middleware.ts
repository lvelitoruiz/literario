import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo protegemos la categoría HAYLA
  if (pathname.startsWith("/categoria/hayla")) {
    const token = request.cookies.get("hayla_auth")?.value;

    if (token === "ok") {
      return NextResponse.next();
    }

    const redirectUrl = new URL("/hayla-acceso", request.url);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/categoria/:path*"],
};

