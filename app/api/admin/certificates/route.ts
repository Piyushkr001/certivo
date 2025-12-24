// app/api/admin/certificates/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import {
  certificates,
  certificateActivities,
  organizations,
  users,
} from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function generateCertificateCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `CERT-INT-${year}-${random}`;
}

function makePlaceholderEmail(code: string) {
  // deterministic + unique-ish; avoids relying on recipient email
  return `cert-${code.toLowerCase()}@placeholder.certivo.local`;
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
 * Admin-only list endpoint.
 * Optional query params:
 *  - q: search by code/holderName/program/organizationName
 *  - limit: number (default 50, max 200)
 *  - offset: number (default 0)
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    const limitRaw = Number(searchParams.get("limit") ?? "50");
    const offsetRaw = Number(searchParams.get("offset") ?? "0");
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 200)
      : 50;
    const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

    // List newest first. Uses `id` to avoid assumptions about column names.
    const rows = await db.query.certificates.findMany({
      orderBy: (t, { desc }) => [desc(t.id)],
      limit,
      offset,
    });

    // Optional in-memory search (keeps your SQL/schema untouched).
    const filtered = q
      ? rows.filter((c: any) => {
          const hay = [
            c.code,
            c.holderName,
            c.program,
            c.organizationName,
            c.durationText,
            String(c.userId ?? ""),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : rows;

    return NextResponse.json(
      {
        message: "Certificates fetched successfully.",
        certificates: filtered.map((c: any) => ({
          id: c.id,
          code: c.code,
          holderName: c.holderName,
          program: c.program,
          organizationName: c.organizationName,
          durationText: c.durationText, // ✅ include
          issuedAt: c.issuedAt,
          status: c.status,
          userId: c.userId,
          issuedByAdminId: c.issuedByAdminId,
        })),
        pagination: {
          limit,
          offset,
          count: filtered.length,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/admin/certificates error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can access certificates." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to fetch certificates." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/certificates
 * Body: { name, domain, issuedAt, organizationId }
 * Optional: { userId, email, durationText }
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json().catch(() => ({} as any));

    const name = (body.name ?? "").trim();
    const domain = (body.domain ?? "").trim();
    const issuedAt = (body.issuedAt ?? "").trim();
    const organizationIdRaw = body.organizationId;

    // ✅ NEW (optional)
    const durationTextRaw = (body.durationText ?? "").trim();
    const durationText = durationTextRaw ? durationTextRaw : null;

    if (!name || !domain || !issuedAt) {
      return NextResponse.json(
        { message: "Recipient name, domain and issued date are required." },
        { status: 400 }
      );
    }

    // ---- Organization lookup (unchanged) ----
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

    // ---- issuedAt parsing (keep logic; avoid inserting null to allow defaultNow) ----
    let issuedAtDate: Date | undefined = undefined;
    if (issuedAt) {
      const d = new Date(issuedAt);
      issuedAtDate = Number.isNaN(d.getTime()) ? undefined : d;
      // If invalid -> undefined (so DB defaultNow() can apply)
    }

    // ---- Generate code (existing retry logic kept) ----
    let code = generateCertificateCode();
    let createdCert: any = null;
    let retries = 0;

    while (!createdCert && retries < 5) {
      try {
        // ✅ FIX: certificates.userId is NOT NULL in your schema.
        // Resolve a valid userId without changing the visible flow.
        let recipientUserId: number | null = null;

        // (1) if frontend sends userId, use it (optional)
        if (body.userId !== undefined && body.userId !== null) {
          const uid = Number(body.userId);
          if (!Number.isNaN(uid) && uid > 0) {
            const u = await db.query.users.findFirst({
              where: eq(users.id, uid),
            });
            if (!u) {
              return NextResponse.json(
                { message: "Selected user not found." },
                { status: 400 }
              );
            }
            recipientUserId = u.id;
          }
        }

        // (2) if frontend sends email, find or create user (optional)
        if (!recipientUserId) {
          const email = (body.email ?? "").trim().toLowerCase();
          if (email) {
            const existing = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            if (existing) {
              recipientUserId = existing.id;
            } else {
              const [newUser] = await db
                .insert(users)
                .values({
                  name,
                  email,
                  role: "user",
                  isActive: true,
                })
                .returning();

              recipientUserId = newUser.id;
            }
          }
        }

        // (3) if still missing, create a placeholder user (keeps flow unchanged)
        if (!recipientUserId) {
          const placeholderEmail = makePlaceholderEmail(code);

          // If placeholder email somehow collides, that will be caught and retried
          const [newUser] = await db
            .insert(users)
            .values({
              name,
              email: placeholderEmail,
              role: "user",
              isActive: true,
            })
            .returning();

          recipientUserId = newUser.id;
        }

        const values: any = {
          code,
          userId: recipientUserId, // ✅ now always valid
          issuedByAdminId: admin.id,
          holderName: name,
          program: domain,
          organizationName,

          // ✅ NEW: store durationText if provided
          ...(durationText ? { durationText } : {}),

          status: "verified",
        };

        if (issuedAtDate) values.issuedAt = issuedAtDate;

        const [cert] = await db.insert(certificates).values(values).returning();

        createdCert = cert;

        await db.insert(certificateActivities).values({
          certificateId: cert.id,
          adminId: admin.id,
          activityType: "issued",
          description: `Certificate ${code} issued for ${name}.`,
        });
      } catch (err: any) {
        const msg = String(err?.message ?? "");

        // Keep your collision retry logic, but broaden slightly:
        // unique constraint can happen for code OR placeholder email.
        if (
          msg.toLowerCase().includes("duplicate") ||
          msg.toLowerCase().includes("unique")
        ) {
          code = generateCertificateCode();
          retries++;
          continue;
        }

        console.error("Create certificate error:", err);
        return NextResponse.json(
          { message: "Failed to create certificate." },
          { status: 500 }
        );
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
          organizationName: createdCert.organizationName ?? null,
          durationText: createdCert.durationText ?? null, // ✅ return it
          issuedAt: createdCert.issuedAt,
          status: createdCert.status,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/certificates error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Not authenticated." }, { status: 401 });
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
