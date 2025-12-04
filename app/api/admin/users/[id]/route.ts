// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

async function requireAdmin(req: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("certivo_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const payload = await verifyAuthJwt(token);
    const role = payload.role;
    const userId = Number(payload.sub || payload.userId);

    if (!userId || role !== "admin") {
      return {
        error: NextResponse.json(
          { message: "Forbidden: admin only" },
          { status: 403 }
        ),
      };
    }

    return { userId, role };
  } catch (err) {
    console.error("requireAdmin error:", err);
    return {
      error: NextResponse.json({ message: "Invalid token" }, { status: 401 }),
    };
  }
}

// PATCH /api/admin/users/:id
// Update name, role or isActive
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin && admin.error) return admin.error;

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid user id." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, role, isActive } = body as {
      name?: string | null;
      role?: "admin" | "user";
      isActive?: boolean;
    };

    const updateData: any = {};

    if (typeof name !== "undefined") {
      updateData.name = name || null;
    }

    if (typeof role !== "undefined") {
      if (role !== "admin" && role !== "user") {
        return NextResponse.json(
          { message: "Invalid role specified." },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (typeof isActive !== "undefined") {
      updateData.isActive = !!isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      //@ts-ignore
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    if (!updated) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated successfully.", user: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/admin/users/[id] PATCH error:", error);
    return NextResponse.json(
      { message: "Failed to update user." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id
// Soft delete: mark isActive = false
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin && admin.error) return admin.error;

    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Invalid user id." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      //@ts-ignore
      .set({ isActive: false })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      });

    if (!updated) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deactivated successfully.", user: updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/admin/users/[id] DELETE error:", error);
    return NextResponse.json(
      { message: "Failed to deactivate user." },
      { status: 500 }
    );
  }
}
