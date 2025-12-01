// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("certivo_token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      null;

    if (!token) {
      return NextResponse.json({ ok: true, user: null }, { status: 200 });
    }

    const payload = await verifyAuthJwt(token);

    return NextResponse.json({
      ok: true,
      user: {
        id: payload.sub,
        email: (payload as any).email,
        name: (payload as any).name,
        role: (payload as any).role,
      },
    }, { status: 200 });
  } catch (err) {
    console.error("api/auth/me error:", err);
    return NextResponse.json({ ok: true, user: null }, { status: 200 });
  }
}
