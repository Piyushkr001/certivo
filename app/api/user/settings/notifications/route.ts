// app/api/user/settings/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/config/db";
import { userNotificationSettings } from "@/config/schema";
import { requireUser } from "@/lib/require-user";

/**
 * GET /api/user/settings/notifications
 * Returns the current user's notification preferences.
 */
export async function GET(_req: NextRequest) {
  try {
    const user = await requireUser();

    // Try to find an existing row for this user
    const rows = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, user.id))
      .limit(1);

    let settings = rows[0];

    // If none found, create with defaults
    if (!settings) {
      const [created] = await db
        .insert(userNotificationSettings)
        .values({
          userId: user.id,
          notifyInternship: true,
          notifySecurity: true,
          notifyAnnouncements: false,
        })
        .returning();

      settings = created;
    }

    return NextResponse.json(
      {
        notifyInternship: settings.notifyInternship,
        notifySecurity: settings.notifySecurity,
        notifyAnnouncements: settings.notifyAnnouncements,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("GET /api/user/settings/notifications error:", error);

    // If not authenticated, return a 401 so middleware can handle redirect
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message:
          error?.message || "Failed to load notification settings.",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/user/settings/notifications
 * Body: { notifyInternship?: boolean, notifySecurity?: boolean, notifyAnnouncements?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();

    // Basic type-safety; default to sensible values if missing
    const notifyInternship =
      typeof body.notifyInternship === "boolean"
        ? body.notifyInternship
        : true;
    const notifySecurity =
      typeof body.notifySecurity === "boolean"
        ? body.notifySecurity
        : true;
    const notifyAnnouncements =
      typeof body.notifyAnnouncements === "boolean"
        ? body.notifyAnnouncements
        : false;

    // Upsert style: if row exists -> update, else -> insert
    const rows = await db
      .select()
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, user.id))
      .limit(1);

    const now = new Date();

    if (rows.length === 0) {
      await db.insert(userNotificationSettings).values({
        userId: user.id,
        notifyInternship,
        notifySecurity,
        notifyAnnouncements,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await db
        .update(userNotificationSettings)
        .set({
          notifyInternship,
          notifySecurity,
          notifyAnnouncements,
          updatedAt: now,
        })
        .where(eq(userNotificationSettings.userId, user.id));
    }

    return NextResponse.json(
      {
        message: "Notification preferences saved.",
        notifyInternship,
        notifySecurity,
        notifyAnnouncements,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("POST /api/user/settings/notifications error:", error);

    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message:
          error?.message || "Failed to save notification settings.",
      },
      { status: 500 },
    );
  }
}
