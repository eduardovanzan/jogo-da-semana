import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  const isPrivate =
    pathname.startsWith("/escolhas") ||
    pathname.startsWith("/votar") ||
    pathname.startsWith("/resultados") ||
    pathname.startsWith("/admin");

  const isAuth =
    pathname.startsWith("/login") ||
    pathname.startsWith("/cadastro");

  if (!user && isPrivate) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (user && isAuth) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/escolhas/:path*",
    "/votar/:path*",
    "/resultados/:path*",
    "/admin/:path*",
    "/login",
    "/cadastro",
  ],
};
