// app/api/admin/support/route.ts
import { NextRequest, NextResponse } from "next/server";
import { and, eq, desc } from "drizzle-orm";

import { db } from "@/config/db";
import { supportTickets } from "@/config/schema";
import { requireAdmin } from "@/lib/admin-settings";

export async function GET(req: NextRequest) {
  try {
    // Ensure only admins can access
    await requireAdmin();

    const { searchParams } = new URL(req.url);

    const statusParam = searchParams.get("status") || "all"; // all | open | resolved | in_progress
    const limitParam = searchParams.get("limit") || "50";
    const offsetParam = searchParams.get("offset") || "0";

    const limit = Math.min(Math.max(parseInt(limitParam, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(offsetParam, 10) || 0, 0);

    let query = db.select().from(supportTickets);

    if (statusParam !== "all") {
        //@ts-ignore
      query = query.where(eq(supportTickets.status, statusParam));
    }

    const tickets = await query
      .orderBy(desc(supportTickets.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(tickets, { status: 200 });
  } catch (err: any) {
    console.error("Admin support list error:", err);

    if (err instanceof Error && err.message === "UNAUTHENTICATED") {
      return NextResponse.json(
        { message: "Not authenticated." },
        { status: 401 }
      );
    }

    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can view support tickets." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load support tickets." },
      { status: 500 }
    );
  }
}
