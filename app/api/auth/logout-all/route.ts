// app/api/auth/logout-all/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAuthJwt } from "@/lib/auth-jwt";

type AuthUser = {
  id: number;
  email: string;
  role: "admin" | "user";
};

async function getAuthUserIfAny(): Promise<AuthUser | null> {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) return null;

  try {
    const payload = await verifyAuthJwt(token);
    const role = (payload as any).role as "admin" | "user" | undefined;
    const id = Number((payload as any).sub);
    const email = (payload as any).email as string | undefined;

    if (!id || !email || !role) return null;

    return { id, email, role };
  } catch {
    return null;
  }
}

export async function POST(_req: NextRequest) {
  try {
    const auth = await getAuthUserIfAny();

    // Clear cookie on this device
    const res = NextResponse.json(
      {
        message:
          "You have been logged out on this device. To truly log out from all devices, implement token versioning or a sessions table.",
        userId: auth?.id ?? null,
      },
      { status: 200 }
    );

    res.cookies.set("certivo_token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err: any) {
    console.error("POST /api/auth/logout-all error:", err);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
