// app/api/user/deactivate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

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

export async function POST(_req: NextRequest) {
  try {
    const auth = await requireAuthUser();

    const [updated] = await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, auth.id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    const res = NextResponse.json(
      {
        message:
          "Your account has been deactivated. You will no longer be able to log in until it is reactivated by an administrator.",
      },
      { status: 200 }
    );

    // Clear JWT cookie
    res.cookies.set("certivo_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    console.error("POST /api/user/deactivate error:", err);

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
