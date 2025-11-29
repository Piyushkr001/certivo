import { NextRequest, NextResponse } from "next/server";

import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/passwords";
import { signAuthJwt } from "@/lib/auth-jwt";
import { db } from "@/config/db";
import { users } from "@/config/schema";

type Role = "admin" | "user";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

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

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials." },
        { status: 401 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        { message: "Role mismatch. Please select the correct role." },
        { status: 403 }
      );
    }

    if (!user.hashedPassword) {
      return NextResponse.json(
        { message: "This account uses Google login. Please continue with Google." },
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

    return NextResponse.json(
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
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
