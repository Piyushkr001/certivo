// app/api/user/certificates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates, users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
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
    const userId = Number(payload.sub);

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid auth token." },
        { status: 401 }
      );
    }

    const certId = Number(context.params.id);
    if (!certId || Number.isNaN(certId)) {
      return NextResponse.json(
        { message: "Invalid certificate id." },
        { status: 400 }
      );
    }

    // Ensure the certificate belongs to the logged-in user
    const rows = await db
      .select({
        id: certificates.id,
        code: certificates.code,
        holderName: certificates.holderName,
        program: certificates.program,
        organizationName: certificates.organizationName,
        durationText: certificates.durationText,
        status: certificates.status,
        issuedAt: certificates.issuedAt,
        verifiedAt: certificates.verifiedAt,
      })
      .from(certificates)
      .where(
        and(
          eq(certificates.id, certId),
          eq(certificates.userId, userId)
        )
      )
      .limit(1);

    if (!rows.length) {
      return NextResponse.json(
        { message: "Certificate not found." },
        { status: 404 }
      );
    }

    const cert = rows[0];

    return NextResponse.json(cert, { status: 200 });
  } catch (error) {
    console.error("/api/user/certificates/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to load certificate." },
      { status: 500 }
    );
  }
}
