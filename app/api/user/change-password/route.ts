// app/api/user/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";
import { verifyPassword, hashPassword } from "@/lib/passwords";

type AuthUser = {
  id: number;
  email: string;
  role: "admin" | "user";
};

async function requireAuthUser(): Promise<AuthUser> {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) throw new Error("UNAUTHENTICATED");

  const payload = await verifyAuthJwt(token);
  const role = (payload as any).role as "admin" | "user" | undefined;
  const id = Number((payload as any).sub);
  const email = (payload as any).email as string | undefined;

  if (!id || !email || !role) {
    throw new Error("UNAUTHENTICATED");
  }

  return { id, email, role };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthUser();
    const body = await req.json();

    const currentPassword = (body.currentPassword ?? "") as string;
    const newPassword = (body.newPassword ?? "") as string;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.id),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    if (!user.hashedPassword) {
      return NextResponse.json(
        {
          message:
            "This account uses Google login only. Password cannot be changed here.",
        },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(
      currentPassword,
      user.hashedPassword
    );

    if (!isValid) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const newHashed = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ hashedPassword: newHashed })
      .where(eq(users.id, auth.id));

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/user/change-password error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
