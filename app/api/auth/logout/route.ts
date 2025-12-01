// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  // clear cookie
  res.cookies.set({
    name: "certivo_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return res;
}
