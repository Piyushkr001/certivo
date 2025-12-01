// app/api/user/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("certivo_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await verifyAuthJwt(token);
    const userId = Number(payload.sub);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid auth token." },
        { status: 401 }
      );
    }

    // Fetch certificates belonging to this user
    const rows = await db
      .select({
        id: certificates.id,
        code: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
        status: certificates.status,
        issuedAt: certificates.issuedAt,
      })
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(certificates.createdAt);

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("/api/user/certificates error:", error);
    return NextResponse.json(
      { message: "Failed to load certificates." },
      { status: 500 }
    );
  }
}
