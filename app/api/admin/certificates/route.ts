// app/api/admin/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { db } from "@/config/db";
import {
  certificates,
  certificateActivities,
  organizations,
} from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

function generateCertificateCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `CERT-INT-${year}-${random}`;
}

async function requireAdmin() {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) throw new Error("UNAUTHENTICATED");

  const payload = await verifyAuthJwt(token);
  const role = (payload as any).role;

  if (role !== "admin") throw new Error("FORBIDDEN");

  return {
    id: Number((payload as any).sub),
    email: (payload as any).email as string,
  };
}

/**
 * GET /api/admin/certificates
 * Returns recently issued certificates for admin view.
 */
export async function GET() {
  try {
    await requireAdmin();

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
      .limit(50);

    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/admin/certificates error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can view certificates." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load certificates." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/certificates
 * Body: { name, domain, issuedAt, organizationId }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({} as any));

    const name = (body.name ?? "").trim();
    const domain = (body.domain ?? "").trim();
    const issuedAt = (body.issuedAt ?? "").trim();
    const organizationIdRaw = body.organizationId;

    if (!name || !domain || !issuedAt) {
      return NextResponse.json(
        {
          message:
            "Recipient name, domain and issued date are required.",
        },
        { status: 400 }
      );
    }

    let organizationName: string | null = null;

    if (organizationIdRaw !== undefined && organizationIdRaw !== null) {
      const orgId = Number(organizationIdRaw);
      if (!Number.isNaN(orgId) && orgId > 0) {
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, orgId),
        });

        if (!org) {
          return NextResponse.json(
            { message: "Selected organization not found." },
            { status: 400 }
          );
        }

        organizationName = org.name;
      }
    }

    // Parse issued date as Date, fallback to now if invalid
    let issuedAtDate: Date | null = null;
    if (issuedAt) {
      const d = new Date(issuedAt);
      issuedAtDate = Number.isNaN(d.getTime()) ? null : d;
    }

    // Generate unique certificate code (retry if collision)
    let code = generateCertificateCode();
    let createdCert = null;
    let retries = 0;

    while (!createdCert && retries < 5) {
      try {
        const [cert] = await db
          .insert(certificates)
          //@ts-ignore
          .values({
            code,
            // In many setups userId can be nullable for admin-issued certs:
            userId: null, // adjust if your schema requires userId
            issuedByAdminId: admin.id,
            holderName: name,
            program: domain,
            organizationName,
            status: "verified", // or "pending" if you want manual approval
            issuedAt: issuedAtDate,
          })
          .returning();

        createdCert = cert;

        await db.insert(certificateActivities).values({
          certificateId: cert.id,
          adminId: admin.id,
          activityType: "issued",
          description: `Certificate ${code} issued for ${name}.`,
        });
      } catch (err: any) {
        const msg = String(err?.message ?? "");
        if (msg.includes("duplicate") || msg.includes("unique")) {
          code = generateCertificateCode();
          retries++;
        } else {
          console.error("Create certificate error:", err);
          return NextResponse.json(
            { message: "Failed to create certificate." },
            { status: 500 }
          );
        }
      }
    }

    if (!createdCert) {
      return NextResponse.json(
        { message: "Failed to generate a unique certificate code." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Certificate issued successfully.",
        certificate: {
          id: createdCert.id,
          code: createdCert.code,
          holderName: createdCert.holderName,
          program: createdCert.program,
          issuedAt: createdCert.issuedAt,
          status: createdCert.status,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/certificates error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can issue certificates." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to issue certificate." },
      { status: 500 }
    );
  }
}
