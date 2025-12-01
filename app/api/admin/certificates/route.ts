// app/api/admin/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { desc } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates, certificateActivities } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

// Simple helper to generate a readable certificate code
function generateCertificateCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit
  return `CERT-INT-${year}-${random}`;
}

// GET /api/admin/certificates
// Returns a list of recently issued certificates (admin only)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("certivo_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await verifyAuthJwt(token);
    const role = payload.role;

    if (!role || role !== "admin") {
      return NextResponse.json(
        { message: "Only admins can view certificates." },
        { status: 403 }
      );
    }

    const rows = await db
      .select({
        id: certificates.id,
        code: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
        issuedAt: certificates.issuedAt,
        status: certificates.status,
      })
      .from(certificates)
      .orderBy(desc(certificates.createdAt))
      .limit(50); // adjust limit as you like

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("/api/admin/certificates GET error:", error);
    return NextResponse.json(
      { message: "Failed to load certificates." },
      { status: 500 }
    );
  }
}

// POST /api/admin/certificates
// Issues a new certificate (admin only)
export async function POST(req: NextRequest) {
  try {
    // ---- Auth: only admins can issue certificates ----
    const cookieStore = await cookies();
    const token = cookieStore.get("certivo_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    const payload = await verifyAuthJwt(token);
    const role = payload.role;
    const adminId = Number(payload.sub);

    if (!role || role !== "admin" || !adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        { message: "Only admins can issue certificates." },
        { status: 403 }
      );
    }

    // ---- Read & validate body ----
    const body = await req.json();
    const { name, domain, issuedAt } = body as {
      name?: string;
      domain?: string;
      issuedAt?: string;
    };

    if (!name || !domain || !issuedAt) {
      return NextResponse.json(
        { message: "Name, domain, and issued date are required." },
        { status: 400 }
      );
    }

    const issuedDate = new Date(issuedAt);
    if (Number.isNaN(issuedDate.getTime())) {
      return NextResponse.json(
        { message: "Invalid issued date." },
        { status: 400 }
      );
    }

    const code = generateCertificateCode();

    // ---- Insert certificate ----
    const [inserted] = await db
      .insert(certificates)
      //@ts-ignore
      .values({
        code,
        holderName: name,
        program: domain,
        issuedAt: issuedDate,
        status: "verified", // or "pending" if you want manual approval
        issuedByAdminId: adminId, // adjust if your schema uses a different field name
      })
      .returning({
        id: certificates.id,
        code: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
        issuedAt: certificates.issuedAt,
        status: certificates.status,
      });

    // ---- Log activity (optional; remove if you don't have this table) ----
    try {
      await db.insert(certificateActivities).values({
        certificateId: inserted.id,
        adminId,
        activityType: "issued",
        description: `Certificate ${inserted.code} issued to ${inserted.holderName}.`,
      });
    } catch (err) {
      console.warn("Failed to log certificate activity:", err);
    }

    return NextResponse.json(
      {
        message: "Certificate issued successfully.",
        certificate: inserted,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("/api/admin/certificates POST error:", error);
    return NextResponse.json(
      { message: "Failed to issue certificate." },
      { status: 500 }
    );
  }
}
