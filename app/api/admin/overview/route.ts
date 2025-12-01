// app/api/admin/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { db } from "@/config/db"; 
import {
  users,
  certificates,
  certificateActivities,
} from "@/config/schema"; 
import { verifyAuthJwt } from "@/lib/auth-jwt";

function formatTimeAgo(date: Date): string {
  const now = new Date().getTime();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
}

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
    const role = (payload as any).role;

    if (!userId || role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden: admin only" },
        { status: 403 }
      );
    }

    // Make sure this admin exists
    const adminRow = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.role, "admin")))
      .limit(1);

    if (adminRow.length === 0) {
      return NextResponse.json(
        { message: "Admin not found" },
        { status: 404 }
      );
    }

    // Total certificates
    const allCertificates = await db.select({ id: certificates.id }).from(certificates);
    const totalCertificates = allCertificates.length;

    // Pending verifications
    const pendingRows = await db
      .select({ id: certificates.id })
      .from(certificates)
      .where(eq(certificates.status, "pending"));
    const pendingVerifications = pendingRows.length;

    // Active admins
    const activeAdminsRows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));
    const activeAdmins = activeAdminsRows.length;

    // Recent activity (last 5 actions)
    const activityRows = await db
      .select({
        id: certificateActivities.id,
        activityType: certificateActivities.activityType,
        description: certificateActivities.description,
        createdAt: certificateActivities.createdAt,
        certCode: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
      })
      .from(certificateActivities)
      .leftJoin(
        certificates,
        eq(certificateActivities.certificateId, certificates.id)
      )
      .orderBy(desc(certificateActivities.createdAt))
      .limit(5);

    const recentActivity = activityRows.map((row) => {
      const createdAt = row.createdAt ? new Date(row.createdAt) : new Date();
      const title =
        row.description ||
        `${row.certCode ?? "Certificate"} ${row.activityType}`;
      const subtitle =
        row.holderName && row.program
          ? `${row.holderName} — ${row.program}`
          : row.holderName || row.program || "";

      return {
        id: row.id,
        title,
        subtitle,
        timeAgo: formatTimeAgo(createdAt),
      };
    });

    return NextResponse.json(
      {
        stats: {
          totalCertificates,
          pendingVerifications,
          activeAdmins,
        },
        recentActivity,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("admin overview error:", err);
    return NextResponse.json(
      { message: "Failed to load admin dashboard" },
      { status: 500 }
    );
  }
}
