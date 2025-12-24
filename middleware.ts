// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthJwt } from "./lib/auth-jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Route classification
  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/dashboard");

  // ✅ NEW: Auth pages classification (guest-only)
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // Read token from HttpOnly cookie or Bearer header (same precedence as before)
  const cookieToken = req.cookies.get("certivo_token")?.value || null;
  const headerToken = req.headers.get("authorization")?.replace("Bearer ", "");
  const token = cookieToken || headerToken || null;

  // ✅ NEW: If already logged in, block access to /login and /signup
  if (isAuthRoute && token) {
    try {
      const payload = await verifyAuthJwt(token);
      const role = (payload as any).role as "admin" | "user" | undefined;

      const url = req.nextUrl.clone();
      url.pathname = role === "admin" ? "/admin" : "/dashboard";
      url.search = ""; // keep it clean (no redirect params)
      return NextResponse.redirect(url);
    } catch (err) {
      // Invalid/expired token: allow auth routes, but clear cookie to avoid loops
      const res = NextResponse.next();
      res.cookies.set("certivo_token", "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  // Only protect /admin/* and /dashboard/* paths (unchanged)
  if (!isAdminRoute && !isUserRoute) {
    return NextResponse.next();
  }

  // Not logged in → redirect to login with redirect + type hint (unchanged)
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    if (isAdminRoute) url.searchParams.set("type", "admin");
    if (isUserRoute) url.searchParams.set("type", "user");

    return NextResponse.redirect(url);
  }

  try {
    // Verify JWT and extract role (unchanged)
    const payload = await verifyAuthJwt(token);
    const role = (payload as any).role as "admin" | "user" | undefined;

    // 🔐 Only admins can access /admin/* (unchanged)
    if (isAdminRoute && role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard"; // non-admins → user dashboard
      return NextResponse.redirect(url);
    }

    // 🔐 Only users can access /dashboard/* (unchanged)
    // (If you ever want admins to access dashboard too, remove this block.)
    if (isUserRoute && role !== "user") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin"; // non-users → admin dashboard
      return NextResponse.redirect(url);
    }

    // Authenticated and role matches route → allow request (unchanged)
    return NextResponse.next();
  } catch (err) {
    console.error("middleware token verification failed:", err);

    // Invalid/expired token → redirect to login and clear cookie (unchanged)
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    const res = NextResponse.redirect(url);
    res.cookies.set("certivo_token", "", { maxAge: 0, path: "/" });
    return res;
  }
}

// ✅ Update matcher to include /login and /signup without impacting existing logic
export const config = {
  matcher: ["/login", "/signup", "/dashboard/:path*", "/admin/:path*"],
};
