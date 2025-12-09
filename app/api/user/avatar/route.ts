// app/api/user/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthUser();

    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "Avatar file is required (field name 'avatar')." },
        { status: 400 }
      );
    }

    const maxSizeBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: "Avatar must be smaller than 2 MB." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload an image." },
        { status: 400 }
      );
    }

    // Convert to base64 data URL (simple for project demo)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/png";
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const [updated] = await db
      .update(users)
      .set({ picture: dataUrl })
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
        message: "Avatar updated successfully.",
        picture: dataUrl,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/user/avatar error:", err);

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
