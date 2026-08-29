import { and, desc, eq, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  adminUsers,
  authCodes,
  InsertAdminUser,
  InsertSiteImage,
  InsertUser,
  InsertWholesaleInquiry,
  InsertWholesaleUser,
  queryLogs,
  siteImages,
  users,
  wholesaleInquiries,
  wholesaleUsers,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

/* ----------------------------- Manus users (template compat) ----------------------------- */

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  (["name", "email", "loginMethod"] as const).forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    (values as any)[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/* ----------------------------- Admin users ----------------------------- */

export async function getAdminByEmail(email: string) {
  const db = await requireDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  return rows[0];
}

export async function getAdminById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return rows[0];
}

export async function createAdmin(data: InsertAdminUser) {
  const db = await requireDb();
  await db.insert(adminUsers).values(data);
}

export async function countAdmins(): Promise<number> {
  const db = await requireDb();
  const rows = await db.select({ c: sql<number>`count(*)` }).from(adminUsers);
  return Number(rows[0]?.c ?? 0);
}

export async function updateAdminLastSignedIn(id: number) {
  const db = await requireDb();
  await db.update(adminUsers).set({ lastSignedIn: new Date() }).where(eq(adminUsers.id, id));
}

/* ----------------------------- Auth codes ----------------------------- */

export async function findAuthCode(code: string) {
  const db = await requireDb();
  const rows = await db.select().from(authCodes).where(eq(authCodes.code, code)).limit(1);
  return rows[0];
}

export async function listAuthCodes(opts: { search?: string; limit: number; offset: number }) {
  const db = await requireDb();
  const where = opts.search ? like(authCodes.code, `%${opts.search}%`) : undefined;
  const rows = await db
    .select()
    .from(authCodes)
    .where(where)
    .orderBy(desc(authCodes.id))
    .limit(opts.limit)
    .offset(opts.offset);
  const countRows = await db.select({ c: sql<number>`count(*)` }).from(authCodes).where(where);
  return { rows, total: Number(countRows[0]?.c ?? 0) };
}

export async function addAuthCode(code: string) {
  const db = await requireDb();
  await db.insert(authCodes).values({ code }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
}

/** Bulk insert codes, ignoring duplicates. Returns number of inserted+seen. */
export async function bulkInsertAuthCodes(codes: string[]): Promise<{ processed: number }> {
  const db = await requireDb();
  const unique = Array.from(new Set(codes.map((c) => c.trim()).filter(Boolean)));
  if (unique.length === 0) return { processed: 0 };
  const CHUNK = 500;
  for (let i = 0; i < unique.length; i += CHUNK) {
    const chunk = unique.slice(i, i + CHUNK).map((code) => ({ code }));
    await db.insert(authCodes).values(chunk).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  }
  return { processed: unique.length };
}

export async function deleteAuthCode(id: number) {
  const db = await requireDb();
  await db.delete(authCodes).where(eq(authCodes.id, id));
}

/* ----------------------------- Query logs ----------------------------- */

export async function insertQueryLog(data: {
  code: string;
  result: "valid" | "not_found";
  ip?: string | null;
  userAgent?: string | null;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(queryLogs).values(data);
}

export async function listQueryLogs(opts: { search?: string; limit: number; offset: number }) {
  const db = await requireDb();
  const where = opts.search ? like(queryLogs.code, `%${opts.search}%`) : undefined;
  const rows = await db
    .select()
    .from(queryLogs)
    .where(where)
    .orderBy(desc(queryLogs.id))
    .limit(opts.limit)
    .offset(opts.offset);
  const countRows = await db.select({ c: sql<number>`count(*)` }).from(queryLogs).where(where);
  return { rows, total: Number(countRows[0]?.c ?? 0) };
}

/* ----------------------------- Wholesale inquiries ----------------------------- */

export async function createInquiry(data: InsertWholesaleInquiry) {
  const db = await requireDb();
  const res = await db.insert(wholesaleInquiries).values(data);
  return res;
}

export async function listInquiries(opts: { search?: string; status?: string; limit: number; offset: number }) {
  const db = await requireDb();
  const conditions = [] as any[];
  if (opts.search) {
    conditions.push(
      sql`(${wholesaleInquiries.name} LIKE ${`%${opts.search}%`} OR ${wholesaleInquiries.company} LIKE ${`%${opts.search}%`} OR ${wholesaleInquiries.email} LIKE ${`%${opts.search}%`})`
    );
  }
  if (opts.status && opts.status !== "all") {
    conditions.push(eq(wholesaleInquiries.status, opts.status as any));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db
    .select()
    .from(wholesaleInquiries)
    .where(where)
    .orderBy(desc(wholesaleInquiries.id))
    .limit(opts.limit)
    .offset(opts.offset);
  const countRows = await db.select({ c: sql<number>`count(*)` }).from(wholesaleInquiries).where(where);
  return { rows, total: Number(countRows[0]?.c ?? 0) };
}

export async function getInquiryById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(wholesaleInquiries).where(eq(wholesaleInquiries.id, id)).limit(1);
  return rows[0];
}

export async function updateInquiryStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await requireDb();
  await db.update(wholesaleInquiries).set({ status }).where(eq(wholesaleInquiries.id, id));
}

export async function listAllInquiriesForExport() {
  const db = await requireDb();
  return db.select().from(wholesaleInquiries).orderBy(desc(wholesaleInquiries.id));
}

/* ----------------------------- Wholesale users ----------------------------- */

export async function getWholesaleUserByEmail(email: string) {
  const db = await requireDb();
  const rows = await db.select().from(wholesaleUsers).where(eq(wholesaleUsers.email, email)).limit(1);
  return rows[0];
}

export async function getWholesaleUserById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(wholesaleUsers).where(eq(wholesaleUsers.id, id)).limit(1);
  return rows[0];
}

export async function getWholesaleUserByToken(token: string) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(wholesaleUsers)
    .where(eq(wholesaleUsers.registrationToken, token))
    .limit(1);
  return rows[0];
}

export async function createWholesaleUser(data: InsertWholesaleUser) {
  const db = await requireDb();
  await db.insert(wholesaleUsers).values(data).onDuplicateKeyUpdate({
    set: {
      name: data.name,
      company: data.company,
      phone: data.phone,
      status: data.status,
      registrationToken: data.registrationToken,
      registrationTokenExpiresAt: data.registrationTokenExpiresAt,
    },
  });
  return getWholesaleUserByEmail(data.email);
}

export async function updateWholesaleUser(
  id: number,
  data: Partial<InsertWholesaleUser>
) {
  const db = await requireDb();
  await db.update(wholesaleUsers).set(data).where(eq(wholesaleUsers.id, id));
}

export async function listWholesaleUsers(opts: { search?: string; limit: number; offset: number }) {
  const db = await requireDb();
  const where = opts.search
    ? sql`(${wholesaleUsers.name} LIKE ${`%${opts.search}%`} OR ${wholesaleUsers.company} LIKE ${`%${opts.search}%`} OR ${wholesaleUsers.email} LIKE ${`%${opts.search}%`})`
    : undefined;
  const rows = await db
    .select()
    .from(wholesaleUsers)
    .where(where)
    .orderBy(desc(wholesaleUsers.id))
    .limit(opts.limit)
    .offset(opts.offset);
  const countRows = await db.select({ c: sql<number>`count(*)` }).from(wholesaleUsers).where(where);
  return { rows, total: Number(countRows[0]?.c ?? 0) };
}

/* ----------------------------- Site images ----------------------------- */

export async function upsertSiteImage(data: InsertSiteImage) {
  const db = await requireDb();
  await db.insert(siteImages).values(data);
  return getSiteImageBySlot(data.slot);
}

export async function getSiteImageBySlot(slot: string) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(siteImages)
    .where(eq(siteImages.slot, slot))
    .orderBy(desc(siteImages.id))
    .limit(1);
  return rows[0];
}

export async function getSiteImageById(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(siteImages).where(eq(siteImages.id, id)).limit(1);
  return rows[0];
}

export async function listSiteImages() {
  const db = await requireDb();
  return db.select().from(siteImages).orderBy(desc(siteImages.id));
}

/** Returns a map of slot -> latest image url for the public site. */
export type PublicMediaEntry = { url: string; mimeType: string | null };

export async function getPublicImageMap(): Promise<Record<string, PublicMediaEntry>> {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(siteImages).orderBy(desc(siteImages.id));
  const map: Record<string, PublicMediaEntry> = {};
  for (const row of rows) {
    if (!(row.slot in map)) map[row.slot] = { url: row.url, mimeType: row.mimeType ?? null };
  }
  return map;
}

export async function deleteSiteImage(id: number) {
  const db = await requireDb();
  await db.delete(siteImages).where(eq(siteImages.id, id));
}

export async function getDashboardStats() {
  const db = await requireDb();
  const [codes] = await db.select({ c: sql<number>`count(*)` }).from(authCodes);
  const [logs] = await db.select({ c: sql<number>`count(*)` }).from(queryLogs);
  const [pendingInq] = await db
    .select({ c: sql<number>`count(*)` })
    .from(wholesaleInquiries)
    .where(eq(wholesaleInquiries.status, "pending"));
  const [totalInq] = await db.select({ c: sql<number>`count(*)` }).from(wholesaleInquiries);
  const [wsUsers] = await db.select({ c: sql<number>`count(*)` }).from(wholesaleUsers);
  const [validLogs] = await db
    .select({ c: sql<number>`count(*)` })
    .from(queryLogs)
    .where(eq(queryLogs.result, "valid"));
  return {
    totalCodes: Number(codes?.c ?? 0),
    totalLogs: Number(logs?.c ?? 0),
    validLogs: Number(validLogs?.c ?? 0),
    pendingInquiries: Number(pendingInq?.c ?? 0),
    totalInquiries: Number(totalInq?.c ?? 0),
    wholesaleUsers: Number(wsUsers?.c ?? 0),
  };
}
