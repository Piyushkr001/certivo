// app/api/admin/settings/verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { adminSettings } from "@/config/schema";
import {
  requireAdmin,
  getOrCreateAdminSettings,
  type AdminSettingsRow,
} from "@/lib/admin-settings";

type VerificationSettingsPayload = {
  autoVerifyImports?: boolean;
  requireReviewForManual?: boolean;
  lockStatusAfterDownload?: boolean;
};

export async function GET() {
  try {
    await requireAdmin();

    const settings = await getOrCreateAdminSettings();

    return NextResponse.json(
      {
        autoVerifyImports: settings.autoVerifyImports,
        requireReviewForManual: settings.requireReviewForManual,
        lockStatusAfterDownload: settings.lockStatusAfterDownload,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/admin/settings/verification error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can access verification settings." },
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

    const body = (await req.json()) as VerificationSettingsPayload;
    const current = await getOrCreateAdminSettings();

    const update: Partial<AdminSettingsRow> = {};
    if (typeof body.autoVerifyImports === "boolean") {
      update.autoVerifyImports = body.autoVerifyImports;
    }
    if (typeof body.requireReviewForManual === "boolean") {
      update.requireReviewForManual = body.requireReviewForManual;
    }
    if (typeof body.lockStatusAfterDownload === "boolean") {
      update.lockStatusAfterDownload = body.lockStatusAfterDownload;
    }

    if (Object.keys(update).length === 0) {
      // Nothing to change
      return NextResponse.json(
        {
          message: "No changes provided.",
          settings: {
            autoVerifyImports: current.autoVerifyImports,
            requireReviewForManual: current.requireReviewForManual,
            lockStatusAfterDownload: current.lockStatusAfterDownload,
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
        message: "Verification settings updated.",
        settings: {
          autoVerifyImports: updated.autoVerifyImports,
          requireReviewForManual: updated.requireReviewForManual,
          lockStatusAfterDownload: updated.lockStatusAfterDownload,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("POST /api/admin/settings/verification error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can update verification settings." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
