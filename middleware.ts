// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthJwt } from "./lib/auth-jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Route classification
  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/dashboard");

  // Only protect /admin/* and /dashboard/* paths
  if (!isAdminRoute && !isUserRoute) {
    return NextResponse.next();
  }

  // Read token from HttpOnly cookie or Bearer header (same precedence as before)
  const cookieToken = req.cookies.get("certivo_token")?.value || null;
  const headerToken = req.headers.get("authorization")?.replace("Bearer ", "");
  const token = cookieToken || headerToken || null;

  // Not logged in → redirect to login with redirect + type hint
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    if (isAdminRoute) url.searchParams.set("type", "admin");
    if (isUserRoute) url.searchParams.set("type", "user");

    return NextResponse.redirect(url);
  }

  try {
    // Verify JWT and extract role
    const payload = await verifyAuthJwt(token);
    const role = (payload as any).role as "admin" | "user" | undefined;

    // 🔐 Only admins can access /admin/*
    if (isAdminRoute && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard"; // non-admins → user dashboard
      return NextResponse.redirect(url);
    }

    // 🔐 Only users can access /dashboard/*
    // (If you ever want admins to access dashboard too, remove this block.)
    if (isUserRoute && role !== "user") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin"; // non-users → admin dashboard
      return NextResponse.redirect(url);
    }

    // Authenticated and role matches route → allow request
    return NextResponse.next();
  } catch (err) {
    console.error("middleware token verification failed:", err);

    // Invalid/expired token → redirect to login and clear cookie
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    const res = NextResponse.redirect(url);
    res.cookies.set("certivo_token", "", { maxAge: 0, path: "/" });
    return res;
  }
}

// 👇 Keep matcher as-is (protects /dashboard/* and /admin/*)
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
