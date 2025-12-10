// lib/admin-settings.ts
import { cookies } from "next/headers";
import { db } from "@/config/db";
import { adminSettings } from "@/config/schema";
import { verifyAuthJwt } from "@/lib/auth-jwt";

export type AdminSettingsRow = typeof adminSettings.$inferSelect;

export type VerificationSettings = {
  autoVerifyImports: boolean;
  requireReviewForManual: boolean;
  lockStatusAfterDownload: boolean;
};

export type PublicPortalSettings = {
  publicLookupEnabled: boolean;
  showOrgNameOnPublic: boolean;
  allowPublicPdfDownload: boolean;
};

const DEFAULT_VERIFICATION_SETTINGS: VerificationSettings = {
  autoVerifyImports: true,
  requireReviewForManual: false,
  lockStatusAfterDownload: false,
};

const DEFAULT_PUBLIC_PORTAL_SETTINGS: PublicPortalSettings = {
  publicLookupEnabled: true,
  showOrgNameOnPublic: true,
  allowPublicPdfDownload: true,
};

// 🔐 Reusable admin guard for server-side code (routes, server actions)
export async function requireAdmin() {
  const token = (await cookies()).get("certivo_token")?.value ?? null;
  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }

  const payload = await verifyAuthJwt(token);
  const role = (payload as any).role;

  if (role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return {
    id: Number((payload as any).sub),
    email: (payload as any).email as string,
  };
}

// Ensure we always have exactly one row of admin settings
export async function getOrCreateAdminSettings(): Promise<AdminSettingsRow> {
  const rows = await db.select().from(adminSettings).limit(1);
  if (rows.length > 0) return rows[0];

  // Insert with defaults from the DB schema
  const [created] = await db.insert(adminSettings).values({}).returning();
  return created;
}

// High-level helpers used by other APIs

export async function getVerificationSettings(): Promise<VerificationSettings> {
  const row = await getOrCreateAdminSettings();

  return {
    autoVerifyImports:
      row.autoVerifyImports ?? DEFAULT_VERIFICATION_SETTINGS.autoVerifyImports,
    requireReviewForManual:
      row.requireReviewForManual ??
      DEFAULT_VERIFICATION_SETTINGS.requireReviewForManual,
    lockStatusAfterDownload:
      row.lockStatusAfterDownload ??
      DEFAULT_VERIFICATION_SETTINGS.lockStatusAfterDownload,
  };
}

export async function getPublicPortalSettings(): Promise<PublicPortalSettings> {
  const row = await getOrCreateAdminSettings();

  return {
    publicLookupEnabled:
      row.publicLookupEnabled ??
      DEFAULT_PUBLIC_PORTAL_SETTINGS.publicLookupEnabled,
    showOrgNameOnPublic:
      row.showOrgNameOnPublic ??
      DEFAULT_PUBLIC_PORTAL_SETTINGS.showOrgNameOnPublic,
    allowPublicPdfDownload:
      row.allowPublicPdfDownload ??
      DEFAULT_PUBLIC_PORTAL_SETTINGS.allowPublicPdfDownload,
  };
}
