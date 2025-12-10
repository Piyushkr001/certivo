// app/api/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { certificates, certificateActivities } from "@/config/schema";
import { getPublicPortalSettings } from "@/lib/admin-settings";

/**
 * Public verification endpoint
 * GET /api/verify?code=CERT-INT-2025-00123
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim();

    if (!code) {
      return NextResponse.json(
        { message: "Certificate ID is required." },
        { status: 400 }
      );
    }

    // Load portal settings (showOrgNameOnPublic, allowPublicPdfDownload, etc.)
    const portalSettings = await getPublicPortalSettings();

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
      .where(eq(certificates.code, code))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json(
        {
          found: false,
          message:
            "No certificate found for this ID. Please check the Certificate ID and try again.",
        },
        { status: 404 }
      );
    }

    const cert = rows[0];
    const now = new Date();

    // Respect "showOrgNameOnPublic" by masking organization name when disabled
    const safeCertificate = {
      ...cert,
      organizationName: portalSettings.showOrgNameOnPublic
        ? cert.organizationName
        : null,
    };

    // Update last verification time + log activity.
    // NOTE: we do NOT change `status` here; admins still manage pending/verified/rejected.
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
        adminId: null, // public lookup, no admin user
        activityType: "lookup", // or "verification_check" if you prefer
        description: `Public verification lookup for certificate ${cert.code}.`,
      }),
    ]);

    return NextResponse.json(
      {
        found: true,
        certificate: {
          ...safeCertificate,
          verifiedAt: now, // return the updated timestamp
        },
        publicPortal: portalSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("verify api error:", error);
    return NextResponse.json(
      {
        message:
          "Something went wrong while verifying this certificate.",
      },
      { status: 500 }
    );
  }
}
