import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  integer,
  boolean,
  uniqueIndex,
  varchar,
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
  
  isActive: boolean("is_active").notNull().default(true),

  // ✅ NEW: notification preferences
  notifyInternship: boolean("notify_internship")
    .notNull()
    .default(true),

  notifySecurity: boolean("notify_security")
    .notNull()
    .default(true),

  notifyAnnouncements: boolean("notify_announcements")
    .notNull()
    .default(false),

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


export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),

  // college | company | tpo | other | ...
  type: text("type").notNull().default("college"),

  contactEmail: text("contact_email"),
  contactPerson: text("contact_person"),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),

  // Verification defaults
  autoVerifyImports: boolean("auto_verify_imports")
    .notNull()
    .default(true),
  requireReviewForManual: boolean("require_review_for_manual")
    .notNull()
    .default(false),
  lockStatusAfterDownload: boolean("lock_status_after_download")
    .notNull()
    .default(false),

  // Public portal settings
  publicLookupEnabled: boolean("public_lookup_enabled")
    .notNull()
    .default(true),
  showOrgNameOnPublic: boolean("show_org_name_on_public")
    .notNull()
    .default(true),
  allowPublicPdfDownload: boolean("allow_public_pdf_download")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userNotificationSettings = pgTable(
  "user_notification_settings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    notifyInternship: boolean("notify_internship")
      .notNull()
      .default(true),
    notifySecurity: boolean("notify_security")
      .notNull()
      .default(true),
    notifyAnnouncements: boolean("notify_announcements")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userUnique: uniqueIndex("user_notification_settings_user_unique").on(
      t.userId,
    ),
  }),
);

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),

  subject: text("subject").notNull(),
  description: text("description").notNull(),

  category: varchar("category", { length: 50 })
    .notNull()
    .default("general"),

  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  userRole: varchar("user_role", { length: 50 }),

  status: varchar("status", { length: 50 })
    .notNull()
    .default("open"), // open | in_progress | resolved (later)

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * TYPES
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Certificate = typeof certificates.$inferSelect;
export type NewCertificate = typeof certificates.$inferInsert;

export type CertificateActivity = typeof certificateActivities.$inferSelect;
export type NewCertificateActivity = typeof certificateActivities.$inferInsert;
