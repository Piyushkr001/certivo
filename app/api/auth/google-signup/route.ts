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

    // Check if a user with this email+role already exists
    let user = await db.query.users.findFirst({
      where: and(eq(users.email, profile.email), eq(users.role, role)),
    });

    if (!user) {
      const [created] = await db
        .insert(users)
        .values({
          name: profile.name,
          email: profile.email,
          role,
          googleId: profile.sub,
          picture: profile.picture,
        })
        .returning();

      user = created;
    } else {
      // Optionally update googleId / picture
      await db
        .update(users)
        .set({
          googleId: profile.sub,
          picture: profile.picture,
        })
        .where(eq(users.id, user.id));
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
    console.error("Google signup error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
