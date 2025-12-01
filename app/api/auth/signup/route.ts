// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/passwords";
import { signAuthJwt } from "@/lib/auth-jwt";
import { db } from "@/config/db";
import { users } from "@/config/schema";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ message: "Name, email, password and role are required." }, { status: 400 });
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ message: "Invalid role." }, { status: 400 });
    }

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        hashedPassword,
        role,
      })
      .returning();

    const token = await signAuthJwt(created);

    const res = NextResponse.json({
      token,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      },
    }, { status: 201 });

    res.cookies.set({
      name: "certivo_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
