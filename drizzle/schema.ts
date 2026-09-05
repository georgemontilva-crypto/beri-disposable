import {
  bigint,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing the Manus OAuth flow (kept for template compatibility).
 * NOT used for the public-facing auth system. The proprietary auth lives in
 * `adminUsers` and `wholesaleUsers`.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Proprietary admin accounts (own auth, NOT Manus OAuth).
 * Authenticated with email + bcrypt password hash and a custom JWT session.
 */
export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * Wholesale customer accounts (own auth, NOT Manus OAuth).
 * A user becomes active after admin approval + completing registration via email link.
 */
export const wholesaleUsers = mysqlTable(
  "wholesale_users",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    passwordHash: varchar("passwordHash", { length: 255 }),
    name: varchar("name", { length: 255 }),
    company: varchar("company", { length: 255 }),
    phone: varchar("phone", { length: 64 }),
    // pending -> approved (awaiting password) -> active ; or rejected
    status: mysqlEnum("status", ["pending", "approved", "active", "rejected"])
      .default("pending")
      .notNull(),
    // token sent by email so the user can set a password and finalize registration
    registrationToken: varchar("registrationToken", { length: 128 }),
    registrationTokenExpiresAt: timestamp("registrationTokenExpiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn"),
  },
  (t) => ({
    statusIdx: index("wholesale_status_idx").on(t.status),
    tokenIdx: index("wholesale_token_idx").on(t.registrationToken),
  })
);

export type WholesaleUser = typeof wholesaleUsers.$inferSelect;
export type InsertWholesaleUser = typeof wholesaleUsers.$inferInsert;

/**
 * Wholesale inquiries submitted from the public form.
 * These are leads; the admin can approve one into a wholesaleUser registration.
 */
export const wholesaleInquiries = mysqlTable(
  "wholesale_inquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    // Kept as the display name and filled from first + last, so every existing
    // row and every list that reads `name` keeps working.
    name: varchar("name", { length: 255 }).notNull(),
    firstName: varchar("firstName", { length: 128 }),
    lastName: varchar("lastName", { length: 128 }),
    company: varchar("company", { length: 255 }),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 64 }),
    shippingAddress: text("shippingAddress"),
    businessType: varchar("businessType", { length: 64 }),
    /** Free text rather than an int: applicants write "12+" or "3 stores". */
    locations: varchar("locations", { length: 64 }),
    website: varchar("website", { length: 512 }),
    /** Comma-separated product keys the applicant is interested in. */
    interestedIn: varchar("interestedIn", { length: 255 }),
    about: text("about"),
    /** Uploaded compliance documents, stored as public R2 URLs. */
    businessLicenseUrl: varchar("businessLicenseUrl", { length: 1024 }),
    tobaccoLicenseUrl: varchar("tobaccoLicenseUrl", { length: 1024 }),
    feinUrl: varchar("feinUrl", { length: 1024 }),
    resaleCertUrl: varchar("resaleCertUrl", { length: 1024 }),
    status: mysqlEnum("status", ["pending", "approved", "rejected"])
      .default("pending")
      .notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    statusIdx: index("inquiry_status_idx").on(t.status),
    emailIdx: index("inquiry_email_idx").on(t.email),
  })
);

export type WholesaleInquiry = typeof wholesaleInquiries.$inferSelect;
export type InsertWholesaleInquiry = typeof wholesaleInquiries.$inferInsert;

/**
 * Authentication codes printed on/under BERI product holograms.
 * Customers type the code to verify the product is genuine.
 */
export const authCodes = mysqlTable(
  "auth_codes",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 128 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    codeIdx: index("auth_code_idx").on(t.code),
  })
);

export type AuthCode = typeof authCodes.$inferSelect;
export type InsertAuthCode = typeof authCodes.$inferInsert;

/**
 * Query logs: every verification attempt against an authentication code.
 */
export const queryLogs = mysqlTable(
  "query_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 128 }).notNull(),
    result: mysqlEnum("result", ["valid", "not_found"]).notNull(),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    codeIdx: index("log_code_idx").on(t.code),
    resultIdx: index("log_result_idx").on(t.result),
  })
);

export type QueryLog = typeof queryLogs.$inferSelect;
export type InsertQueryLog = typeof queryLogs.$inferInsert;

/**
 * Site images managed from the admin panel. Stored in object storage
 * (Manus storage in dev, Cloudflare R2 in production via storageKey/url).
 * Images are assigned to named "slots"/sections of the site.
 */
export const siteImages = mysqlTable(
  "site_images",
  {
    id: int("id").autoincrement().primaryKey(),
    // logical slot identifier, e.g. "home_hero", "crush_flavor_tropical_gummy"
    slot: varchar("slot", { length: 128 }).notNull(),
    // human label / section grouping, e.g. "Home", "Beri Crush"
    section: varchar("section", { length: 128 }),
    title: varchar("title", { length: 255 }),
    storageKey: varchar("storageKey", { length: 512 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    width: int("width"),
    height: int("height"),
    sizeBytes: bigint("sizeBytes", { mode: "number" }),
    mimeType: varchar("mimeType", { length: 128 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    slotIdx: index("image_slot_idx").on(t.slot),
    sectionIdx: index("image_section_idx").on(t.section),
  })
);

export type SiteImage = typeof siteImages.$inferSelect;
export type InsertSiteImage = typeof siteImages.$inferInsert;

/**
 * Key/value store for site-wide toggles and small settings.
 *
 * Deliberately schemaless: adding a switch to the admin panel shouldn't need a
 * migration. Values are stored as text and parsed by the caller.
 */
export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/** Newsletter sign-ups from the homepage. */
export const newsletterSubscribers = mysqlTable(
  "newsletter_subscribers",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    // Where on the site the sign-up came from, so future forms can be told apart.
    source: varchar("source", { length: 64 }).default("home"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("newsletter_email_idx").on(t.email),
  })
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
