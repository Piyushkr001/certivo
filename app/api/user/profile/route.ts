// app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

type ProfileUpdateBody = {
  name?: string;
  headline?: string;
  about?: string;
};

type AuthUser = {
  id: number;
  email: string;
  role: "admin" | "user";
};

async function requireAuthUser(): Promise<AuthUser> {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) throw new Error("UNAUTHENTICATED");

  const payload = await verifyAuthJwt(token);
  const role = (payload as any).role as "admin" | "user" | undefined;
  const id = Number((payload as any).sub);
  const email = (payload as any).email as string | undefined;

  if (!id || !email || !role) {
    throw new Error("UNAUTHENTICATED");
  }

  return { id, email, role };
}

/**
 * GET /api/user/profile
 * Returns the authenticated user's profile information.
 */
export async function GET() {
  try {
    const auth = await requireAuthUser();

    const user = await db.query.users.findFirst({
      where: eq(users.id, auth.id),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // cast as any in case these fields are optional in your schema
        headline: (user as any).headline ?? null,
        about: (user as any).about ?? null,
        picture: (user as any).picture ?? null,
        createdAt: (user as any).createdAt ?? null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/user/profile error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Updates the authenticated user's profile (name / headline / about).
 * Does NOT allow changing email or role.
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAuthUser();
    const body = (await req.json()) as ProfileUpdateBody;

    const updates: Record<string, any> = {};

    if (typeof body.name === "string") {
      const trimmed = body.name.trim();
      if (trimmed.length === 0) {
        return NextResponse.json(
          { message: "Name cannot be empty." },
          { status: 400 }
        );
      }
      updates.name = trimmed;
    }

    if (typeof body.headline === "string") {
      updates.headline = body.headline.trim();
    }

    if (typeof body.about === "string") {
      updates.about = body.about.trim();
    }

    // Nothing to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "No changes provided." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, auth.id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated.",
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          headline: (updated as any).headline ?? null,
          about: (updated as any).about ?? null,
          picture: (updated as any).picture ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH /api/user/profile error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
