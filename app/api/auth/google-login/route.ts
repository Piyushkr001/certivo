import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { signAuthJwt } from "@/lib/auth-jwt";
import { db } from "@/config/db";
import { users } from "@/config/schema";

type Role = "admin" | "user";

async function getGoogleProfile(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user profile");
  }

  return res.json() as Promise<{
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken, role } = await req.json();

    if (!accessToken || !role) {
      return NextResponse.json(
        { message: "accessToken and role are required." },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "user") {
      return NextResponse.json({ message: "Invalid role." }, { status: 400 });
    }

    const profile = await getGoogleProfile(accessToken);
    if (!profile.email) {
      return NextResponse.json(
        { message: "Google account does not have a public email." },
        { status: 400 }
      );
    }

    // Try to find by googleId first, then by email
    let user =
      (await db.query.users.findFirst({
        where: and(eq(users.googleId, profile.sub), eq(users.role, role)),
      })) ||
      (await db.query.users.findFirst({
        where: and(eq(users.email, profile.email), eq(users.role, role)),
      }));

    if (!user) {
      return NextResponse.json(
        { message: "No account found. Please sign up first." },
        { status: 404 }
      );
    }

    const token = await signAuthJwt(user);

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Google login error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
