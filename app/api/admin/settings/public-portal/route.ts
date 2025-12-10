// app/api/admin/settings/public-portal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { adminSettings } from "@/config/schema";
import {
  requireAdmin,
  getOrCreateAdminSettings,
  type AdminSettingsRow,
} from "@/lib/admin-settings";

type PublicPortalSettingsPayload = {
  publicLookupEnabled?: boolean;
  showOrgNameOnPublic?: boolean;
  allowPublicPdfDownload?: boolean;
};

export async function GET() {
  try {
    await requireAdmin();

    const settings = await getOrCreateAdminSettings();

    return NextResponse.json(
      {
        publicLookupEnabled: settings.publicLookupEnabled,
        showOrgNameOnPublic: settings.showOrgNameOnPublic,
        allowPublicPdfDownload: settings.allowPublicPdfDownload,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/admin/settings/public-portal error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can access public portal settings." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = (await req.json()) as PublicPortalSettingsPayload;
    const current = await getOrCreateAdminSettings();

    const update: Partial<AdminSettingsRow> = {};
    if (typeof body.publicLookupEnabled === "boolean") {
      update.publicLookupEnabled = body.publicLookupEnabled;
    }
    if (typeof body.showOrgNameOnPublic === "boolean") {
      update.showOrgNameOnPublic = body.showOrgNameOnPublic;
    }
    if (typeof body.allowPublicPdfDownload === "boolean") {
      update.allowPublicPdfDownload = body.allowPublicPdfDownload;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        {
          message: "No changes provided.",
          settings: {
            publicLookupEnabled: current.publicLookupEnabled,
            showOrgNameOnPublic: current.showOrgNameOnPublic,
            allowPublicPdfDownload: current.allowPublicPdfDownload,
          },
        },
        { status: 200 }
      );
    }

    update.updatedAt = new Date();

    const [updated] = await db
      .update(adminSettings)
      .set(update)
      .where(eq(adminSettings.id, current.id))
      .returning();

    return NextResponse.json(
      {
        message: "Public portal settings updated.",
        settings: {
          publicLookupEnabled: updated.publicLookupEnabled,
          showOrgNameOnPublic: updated.showOrgNameOnPublic,
          allowPublicPdfDownload: updated.allowPublicPdfDownload,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/settings/public-portal error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can update public portal settings." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
