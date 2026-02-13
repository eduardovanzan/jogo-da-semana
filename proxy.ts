import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPrivate =
    pathname.startsWith("/escolhas") ||
    pathname.startsWith("/votar") ||
    pathname.startsWith("/resultados") ||
    pathname.startsWith("/admin");

  // apenas exemplo simples
  const hasSession = req.cookies.get("sb-access-token");

  if (isPrivate && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/escolhas/:path*", "/votar/:path*", "/resultados/:path*", "/admin/:path*"],
};
