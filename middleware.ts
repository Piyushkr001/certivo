// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthJwt } from "./lib/auth-jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  if (!needsAuth) return NextResponse.next();

  const token =
    req.cookies.get("certivo_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    null;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const payload = await verifyAuthJwt(token);

    if (pathname.startsWith("/admin")) {
      if ((payload as any).role !== "admin") {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("middleware token verification failed:", err);
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.set("certivo_token", "", { maxAge: 0, path: "/" });
    return res;
  }
}

// 👇 Make matcher a static literal
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
