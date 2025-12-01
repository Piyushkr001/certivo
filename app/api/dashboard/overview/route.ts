// app/api/dashboard/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { verifyAuthJwt } from "@/lib/auth-jwt"; // ⬅️ your existing JWT helper
import { db } from "@/config/db";
import { certificates, users } from "@/config/schema";

export async function GET(req: NextRequest) {
  try {
    const token =
      req.cookies.get("certivo_token")?.value ||
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      null;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuthJwt(token);
    const userId = Number(payload.sub);

    if (!userId) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // Make sure user exists (optional but nice)
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRow.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get recent certificates for this user
    const recentRows = await db
      .select({
        id: certificates.id,
        code: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
        status: certificates.status,
        verifiedAt: certificates.verifiedAt,
        createdAt: certificates.createdAt,
      })
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.createdAt))
      .limit(5);

    const totalCertificates = recentRows.length
      ? (
          await db
            .select({
              id: certificates.id,
            })
            .from(certificates)
            .where(eq(certificates.userId, userId))
        ).length
      : 0;

    // last verified date
    const lastVerifiedRow = await db
      .select({
        verifiedAt: certificates.verifiedAt,
      })
      .from(certificates)
      .where(eq(certificates.userId, userId))
      .orderBy(desc(certificates.verifiedAt))
      .limit(1);

    const lastVerifiedAt = lastVerifiedRow[0]?.verifiedAt ?? null;

    return NextResponse.json(
      {
        stats: {
          totalCertificates,
          lastVerifiedAt,
          accountType: (payload as any).role ?? "user",
        },
        recentCertificates: recentRows.map((row) => ({
          id: row.id,
          code: row.code,
          holderName: row.holderName,
          program: row.program,
          status: row.status as "pending" | "verified" | "rejected",
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("dashboard overview error:", err);
    return NextResponse.json(
      { message: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
