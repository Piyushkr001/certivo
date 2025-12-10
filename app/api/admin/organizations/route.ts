// app/api/admin/organizations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  and,
  desc,
  eq,
  sql,
} from "drizzle-orm";

import { db } from "@/config/db";
import {
  organizations,
  certificates,
} from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

// Optional, but keeps logic DRY and consistent with your other admin routes
async function requireAdmin() {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }

  const payload = await verifyAuthJwt(token);
  const role = (payload as any).role;

  if (role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return {
    id: Number((payload as any).sub),
    email: (payload as any).email as string,
  };
}

/**
 * GET /api/admin/organizations
 * Returns a list of organizations with totalCertificates count.
 */
export async function GET() {
  try {
    await requireAdmin();

    // Aggregate certificates by organizationName matching org.name
    const rows = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        contactEmail: organizations.contactEmail,
        contactPerson: organizations.contactPerson,
        isActive: organizations.isActive,
        createdAt: organizations.createdAt,
        // COUNT(certificates) grouped by org
        totalCertificates: sql<number>`COUNT(${certificates.id})`,
      })
      .from(organizations)
      .leftJoin(
        certificates,
        eq(certificates.organizationName, organizations.name)
      )
      .groupBy(
        organizations.id,
        organizations.name,
        organizations.type,
        organizations.contactEmail,
        organizations.contactPerson,
        organizations.isActive,
        organizations.createdAt
      )
      .orderBy(desc(organizations.createdAt));

    return NextResponse.json(rows, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/admin/organizations error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can manage organizations." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load organizations." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/organizations
 * Body: { name, type, contactEmail?, contactPerson? }
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json().catch(() => ({} as any));

    let name = (body.name ?? "").trim();
    let type = (body.type ?? "college").trim();
    const contactEmail: string | null =
      (body.contactEmail ?? "").trim() || null;
    const contactPerson: string | null =
      (body.contactPerson ?? "").trim() || null;

    if (!name) {
      return NextResponse.json(
        { message: "Organization name is required." },
        { status: 400 }
      );
    }

    // Normalize type to something simple
    type = type.toLowerCase();
    if (!["college", "company", "tpo", "other"].includes(type)) {
      type = "other";
    }

    // Optional: avoid exact duplicates (same name + type)
    const existing = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.name, name),
        eq(organizations.type, type)
      ),
    });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "An organization with the same name and type already exists.",
        },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(organizations)
      .values({
        name,
        type,
        contactEmail,
        contactPerson,
        isActive: true,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Organization created successfully.",
        organization: created,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/organizations error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can manage organizations." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to create organization." },
      { status: 500 }
    );
  }
}
