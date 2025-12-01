import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * USER ROLES
 */
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

/**
 * CERTIFICATE STATUS
 */
export const certificateStatusEnum = pgEnum("certificate_status", [
  "pending",
  "verified",
  "rejected",
]);

/**
 * USERS TABLE
 * - Both admins and normal users
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: text("name"),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),

  role: userRoleEnum("role").notNull().default("user"),

  // for Google OAuth linking
  googleId: text("google_id"),
  picture: text("picture"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * CERTIFICATES TABLE
 * - One row per certificate
 * - Linked to a user (intern/holder)
 * - Optionally linked to an admin who issued it
 */
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),

  // Public-facing code, e.g. "CERT-INT-2025-00123"
  code: text("code").notNull().unique(),

  // Owner of the certificate (intern / user)
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Admin who issued the certificate (optional)
  issuedByAdminId: integer("issued_by_admin_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // Display name on certificate
  holderName: text("holder_name").notNull(),

  // e.g. "Web Development Internship"
  program: text("program").notNull(),

  // e.g. "Zidio Development", "CareMedico", etc.
  organizationName: text("organization_name"),

  // e.g. "June–Aug 2025"
  durationText: text("duration_text"),

  status: certificateStatusEnum("status").notNull().default("pending"),

  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * CERTIFICATE ACTIVITIES TABLE
 * - For admin recent activity feed (issued / verified / rejected / updated)
 */
export const certificateActivities = pgTable("certificate_activities", {
  id: serial("id").primaryKey(),

  certificateId: integer("certificate_id")
    .notNull()
    .references(() => certificates.id, { onDelete: "cascade" }),

  // Admin who performed the action
  adminId: integer("admin_id").references(() => users.id, {
    onDelete: "set null",
  }),

  // e.g. "issued", "verified", "rejected", "updated"
  activityType: text("activity_type").notNull(),

  // e.g. "CERT-INT-2025-01234 issued to John Doe"
  description: text("description"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * RELATIONS (optional but nice for Drizzle queries)
 */
export const usersRelations = relations(users, ({ many }) => ({
  certificates: many(certificates),
  issuedCertificates: many(certificates, {
    relationName: "issued_by_admin",
  }),
  activities: many(certificateActivities),
}));

export const certificatesRelations = relations(certificates, ({ one, many }) => ({
  user: one(users, {
    fields: [certificates.userId],
    references: [users.id],
  }),
  issuedBy: one(users, {
    relationName: "issued_by_admin",
    fields: [certificates.issuedByAdminId],
    references: [users.id],
  }),
  activities: many(certificateActivities),
}));

export const certificateActivitiesRelations = relations(
  certificateActivities,
  ({ one }) => ({
    certificate: one(certificates, {
      fields: [certificateActivities.certificateId],
      references: [certificates.id],
    }),
    admin: one(users, {
      fields: [certificateActivities.adminId],
      references: [users.id],
    }),
  })
);

/**
 * TYPES
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

export type CertificateActivity = typeof certificateActivities.$inferSelect;
export type NewCertificateActivity = typeof certificateActivities.$inferInsert;
