// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { db } from "@/config/db";
import { users } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";
import { hashPassword } from "@/lib/passwords";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

// Small helper to get the admin payload from cookie token
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

// GET /api/admin/users
// List users with optional search, role filter & pagination
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin && admin.error) return admin.error;

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const roleFilter = searchParams.get("role"); // "admin" | "user" | null
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    let pageSize = parseInt(
      searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE),
      10
    );

    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    if (!pageSize || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
    if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;

    const conditions = [];

    if (roleFilter === "admin" || roleFilter === "user") {
      conditions.push(eq(users.role, roleFilter));
    }

    if (q) {
      conditions.push(
        or(
          ilike(users.name, `%${q}%`),
          ilike(users.email, `%${q}%`)
        )
      );
    }

    const whereClause =
      conditions.length === 0
        ? undefined
        : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

    const offset = (page - 1) * pageSize;

    let listQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset);

    let countQuery = db.select({ value: count() }).from(users);

    if (whereClause) {
    //@ts-ignore
      listQuery = listQuery.where(whereClause);
      //@ts-ignore
      countQuery = countQuery.where(whereClause);
    }

    const [rows, totalRows] = await Promise.all([listQuery, countQuery]);
    const total = Number(totalRows[0]?.value || 0);
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

    return NextResponse.json(
      {
        users: rows,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/admin/users GET error:", error);
    return NextResponse.json(
      { message: "Failed to load users." },
      { status: 500 }
    );
  }
}

// POST /api/admin/users
// Create a new account (admin can create both user & admin)
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if ("error" in admin && admin.error) return admin.error;

    const body = await req.json();
    const { name, email, password, role } = body as {
      name?: string;
      email?: string;
      password?: string;
      role?: "admin" | "user";
    };

    if (!email || !password || !role) {
      return NextResponse.json(
        {
          message:
            "Email, password and role are required to create an account.",
        },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { message: "Role must be either 'admin' or 'user'." },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [created] = await db
      .insert(users)
      //@ts-ignore
      .values({
        name: name || null,
        email,
        hashedPassword,
        role,
        isActive: true,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        user: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("/api/admin/users POST error:", error);
    return NextResponse.json(
      { message: "Failed to create user." },
      { status: 500 }
    );
  }
}
