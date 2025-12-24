// app/api/user/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, desc } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("certivo_token")?.value ?? null;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated.", certificates: [] },
        { status: 401 }
      );
    }

    const payload = await verifyAuthJwt(token);
    const userId = Number((payload as any).sub);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid auth token.", certificates: [] },
        { status: 401 }
      );
    }

    const rows = await db
      .select({
        id: certificates.id,
        code: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
        organizationName: certificates.organizationName,
        durationText: certificates.durationText,
        status: certificates.status,
        issuedAt: certificates.issuedAt,
        createdAt: certificates.createdAt,
      })
      .from(certificates)
      .where(eq(certificates.userId, userId))
      // newest first
      .orderBy(desc(certificates.createdAt));

    // ✅ Return in the same shape your UI supports:
    // - either array
    // - or { certificates: [...] }
    return NextResponse.json(
      {
        message: "Certificates fetched successfully.",
        certificates: rows.map((c) => ({
          id: c.id,
          code: c.code,
          holderName: c.holderName,
          program: c.program,
          organizationName: c.organizationName ?? null,
          durationText: c.durationText ?? null,
          status: c.status,
          issuedAt: c.issuedAt,
        })),
        pagination: { count: rows.length },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/user/certificates error:", error);
    return NextResponse.json(
      { message: "Failed to load certificates.", certificates: [] },
      { status: 500 }
    );
  }
}
