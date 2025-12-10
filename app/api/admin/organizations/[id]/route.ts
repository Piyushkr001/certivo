// app/api/admin/organizations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { organizations } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

// Reuse same pattern as other admin routes
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
 * PATCH /api/admin/organizations/:id
 * Body can include any of:
 * { name?, type?, contactEmail?, contactPerson?, isActive? }
 */
export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const orgId = Number(context.params.id);
    if (!orgId || Number.isNaN(orgId)) {
      return NextResponse.json(
        { message: "Invalid organization id." },
        { status: 400 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      type?: string;
      contactEmail?: string | null;
      contactPerson?: string | null;
      isActive?: boolean;
    };

    const updateData: Partial<typeof organizations.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (!trimmed) {
        return NextResponse.json(
          { message: "Organization name cannot be empty." },
          { status: 400 }
        );
      }
      updateData.name = trimmed;
    }

    if (typeof body.type === "string") {
      let t = body.type.trim().toLowerCase();
      if (!["college", "company", "tpo", "other"].includes(t)) {
        t = "other";
      }
      updateData.type = t;
    }

    if (body.contactEmail !== undefined) {
      const email = (body.contactEmail ?? "").toString().trim();
      updateData.contactEmail = email || null;
    }

    if (body.contactPerson !== undefined) {
      const person = (body.contactPerson ?? "").toString().trim();
      updateData.contactPerson = person || null;
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    // If nothing to update besides updatedAt, just return 400
    const keys = Object.keys(updateData).filter((k) => k !== "updatedAt");
    if (!keys.length) {
      return NextResponse.json(
        { message: "Nothing to update." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, orgId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { message: "Organization not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Organization updated successfully.",
        organization: updated,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH /api/admin/organizations/[id] error:", err);

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
      { message: "Failed to update organization." },
      { status: 500 }
    );
  }
}
