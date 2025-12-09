// app/api/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates, certificateActivities } from "@/config/schema";

/**
 * Public verification endpoint
 * GET /api/verify?code=CERT-INT-2025-00123
 *
 * Response shape:
 *  - { found: true, certificate: { ... } }
 *  - { found: false, message: string }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");
    const code = rawCode?.trim();

    if (!code) {
      return NextResponse.json(
        {
          found: false,
          message: "Certificate ID is required.",
        },
        { status: 400 }
      );
    }

    // If your codes are stored uppercase, normalize
    const normalizedCode = code.toUpperCase();

    // Look up certificate by public code
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
      .where(eq(certificates.code, normalizedCode))
      .limit(1);

    if (!rows.length) {
      // IMPORTANT: return 200 + found:false, not 404
      return NextResponse.json(
        {
          found: false,
          message:
            "No certificate found for this ID. Please check the Certificate ID and try again.",
        },
        { status: 200 }
      );
    }

    const cert = rows[0];
    const now = new Date();

    // Update last verification time + log activity
    await Promise.all([
      db
        .update(certificates)
        .set({
          verifiedAt: now,
          updatedAt: now,
        })
        .where(eq(certificates.id, cert.id)),

      db.insert(certificateActivities).values({
        certificateId: cert.id,
        adminId: null, // public lookup
        activityType: "lookup",
        description: `Public verification lookup for certificate ${cert.code}.`,
      }),
    ]);

    return NextResponse.json(
      {
        found: true,
        certificate: {
          ...cert,
          verifiedAt: now, // updated timestamp in response
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("verify api error:", error);
    return NextResponse.json(
      {
        found: false,
        message:
          "Something went wrong while verifying this certificate.",
      },
      { status: 500 }
    );
  }
}
