// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { verifyPassword } from "@/lib/passwords";
import { signAuthJwt } from "@/lib/auth-jwt";
import { db } from "@/config/db";
import { users } from "@/config/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password as string | undefined;
    const role = body.role as "admin" | "user" | undefined;

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "Email, password and role are required." },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { message: "Invalid role." },
        { status: 400 }
      );
    }

    // 🔐 STRONG ROLE SEPARATION:
    // We search by BOTH email AND role.
    // So using the wrong role will not find a user at all.
    const user = await db.query.users.findFirst({
      where: and(eq(users.email, email), eq(users.role, role)),
    });

    // If email+role combo doesn't exist → generic "invalid credentials"
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Optional but recommended: block inactive accounts
    if (user.isActive === false) {
      return NextResponse.json(
        { message: "Your account is deactivated. Contact admin." },
        { status: 403 }
      );
    }

    if (!user.hashedPassword) {
      return NextResponse.json(
        {
          message:
            "This account uses Google login. Please continue with Google.",
        },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(password, user.hashedPassword);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await signAuthJwt(user);

    const res = NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set HttpOnly cookie (server-side)
    res.cookies.set({
      name: "certivo_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
