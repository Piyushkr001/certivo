import {
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: text("name"),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),

  role: userRoleEnum("role").notNull().default("user"),

  googleId: text("google_id"), // for Google OAuth linking
  picture: text("picture"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Drizzle type helpers
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
