// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthJwt } from "./lib/auth-jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/dashboard");

  // Only guard these routes
  if (!isAdminRoute && !isUserRoute) {
    return NextResponse.next();
  }

  // Get token from cookie or Bearer header
  const cookieToken = req.cookies.get("certivo_token")?.value || null;
  const headerToken = req.headers
    .get("authorization")
    ?.replace("Bearer ", "");
  const token = cookieToken || headerToken || null;

  // Not logged in → send to role-specific login page
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    // Optional: hint which login type to show
    if (isAdminRoute) url.searchParams.set("type", "admin");
    if (isUserRoute) url.searchParams.set("type", "user");

    return NextResponse.redirect(url);
  }

  try {
    const payload = await verifyAuthJwt(token);
    const role = (payload as any).role as "admin" | "user" | undefined;

    // 🔐 Only admins can access /admin/*
    if (isAdminRoute && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard"; // send non-admins to user dashboard
      return NextResponse.redirect(url);
    }

    // 🔐 Only users can access /dashboard/*
    // (Remove this block if you WANT admins to see user dashboard too)
    if (isUserRoute && role !== "user") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin"; // send non-users to admin dashboard
      return NextResponse.redirect(url);
    }

    // Role matches route → allow
    return NextResponse.next();
  } catch (err) {
    console.error("middleware token verification failed:", err);

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    const res = NextResponse.redirect(url);
    // Clear bad token
    res.cookies.set("certivo_token", "", { maxAge: 0, path: "/" });
    return res;
  }
}

// 👇 Keep matcher as-is
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
