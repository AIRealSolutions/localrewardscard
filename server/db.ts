import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertLoyaltyAccount,
  InsertMerchantAccrualRule,
  InsertPatronageMilestone,
  InsertPointsLedgerEntry,
  LoyaltyAccount,
  Member,
  Merchant,
  MerchantAccrualRule,
  Offer,
  PatronageMilestone,
  PointsLedgerEntry,
  Redemption,
  loyaltyAccounts,
  members,
  merchantAccrualRules,
  merchants,
  offers,
  patronageMilestones,
  platformAdmins,
  pointsLedger,
  redemptions,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Members (consumers, owned by magicfishbowl) ───────────────────────────────

export async function getMemberByUserId(userId: string): Promise<Member | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.userId, userId)).limit(1);
  return result[0];
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(members).where(eq(members.id, id)).limit(1);
  return result[0];
}

export async function findMemberByPhoneOrEmail(query: string): Promise<Member[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(members)
    .where(sql`${members.phone} ilike ${`%${query}%`} or ${members.email} ilike ${`%${query}%`} or ${members.fullName} ilike ${`%${query}%`}`)
    .limit(20);
}

// ─── Merchants (owned by magicfishbowl) ────────────────────────────────────────

export async function getMerchantByOwnerId(ownerUserId: string): Promise<Merchant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(merchants).where(eq(merchants.ownerUserId, ownerUserId)).limit(1);
  return result[0];
}

export async function getMerchantById(id: string): Promise<Merchant | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(merchants).where(eq(merchants.id, id)).limit(1);
  return result[0];
}

export async function getLiveMerchants(limit = 50, offset = 0): Promise<Merchant[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(merchants)
    .where(eq(merchants.isLive, true))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(merchants.createdAt));
}

// ─── Offers / Redemptions (read-only here, owned by magicfishbowl) ────────────

export async function getActiveOffersByMerchant(merchantId: string): Promise<Offer[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(offers)
    .where(and(eq(offers.merchantId, merchantId), eq(offers.isActive, true)));
}

export async function getRedemptionsByMember(memberId: string, limit = 50): Promise<(Redemption & { offerTitle: string | null; merchantName: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: redemptions.id,
      memberId: redemptions.memberId,
      merchantId: redemptions.merchantId,
      offerId: redemptions.offerId,
      staffId: redemptions.staffId,
      scannedAt: redemptions.scannedAt,
      confirmedAt: redemptions.confirmedAt,
      status: redemptions.status,
      offerTitle: offers.title,
      merchantName: merchants.businessName,
    })
    .from(redemptions)
    .leftJoin(offers, eq(offers.id, redemptions.offerId))
    .leftJoin(merchants, eq(merchants.id, redemptions.merchantId))
    .where(eq(redemptions.memberId, memberId))
    .orderBy(desc(redemptions.scannedAt))
    .limit(limit);
  return rows;
}

// ─── Loyalty Accounts (owned here) ─────────────────────────────────────────────

export async function getOrCreateLoyaltyAccount(memberId: string, merchantId: string): Promise<LoyaltyAccount> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(loyaltyAccounts)
    .where(and(eq(loyaltyAccounts.memberId, memberId), eq(loyaltyAccounts.merchantId, merchantId)))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db.insert(loyaltyAccounts).values({ memberId, merchantId }).returning();
  return created!;
}

export async function getLoyaltyAccountsByMember(memberId: string): Promise<(LoyaltyAccount & { merchant: Merchant | null })[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ account: loyaltyAccounts, merchant: merchants })
    .from(loyaltyAccounts)
    .leftJoin(merchants, eq(merchants.id, loyaltyAccounts.merchantId))
    .where(eq(loyaltyAccounts.memberId, memberId));
  return rows.map((r) => ({ ...r.account, merchant: r.merchant }));
}

export async function getLoyaltyAccountsByMerchant(merchantId: string): Promise<LoyaltyAccount[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyAccounts).where(eq(loyaltyAccounts.merchantId, merchantId));
}

export async function updateLoyaltyAccount(id: string, data: Partial<InsertLoyaltyAccount>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(loyaltyAccounts).set({ ...data, updatedAt: new Date() }).where(eq(loyaltyAccounts.id, id));
}

// ─── Points Ledger (owned here) ────────────────────────────────────────────────

export async function createPointsLedgerEntry(data: InsertPointsLedgerEntry): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(pointsLedger).values(data);
}

export async function getPointsLedgerByAccount(loyaltyAccountId: string, limit = 50): Promise<PointsLedgerEntry[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(pointsLedger)
    .where(eq(pointsLedger.loyaltyAccountId, loyaltyAccountId))
    .orderBy(desc(pointsLedger.createdAt))
    .limit(limit);
}

// ─── Merchant Accrual Rules (owned here) ───────────────────────────────────────

export async function getAccrualRule(merchantId: string): Promise<MerchantAccrualRule | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(merchantAccrualRules).where(eq(merchantAccrualRules.merchantId, merchantId)).limit(1);
  return result[0];
}

export async function upsertAccrualRule(data: InsertMerchantAccrualRule): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(merchantAccrualRules)
    .values(data)
    .onConflictDoUpdate({ target: merchantAccrualRules.merchantId, set: { ...data, updatedAt: new Date() } });
}

// ─── Patronage Milestones (owned here) ─────────────────────────────────────────

export async function getMilestonesByMerchant(merchantId: string): Promise<PatronageMilestone[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patronageMilestones).where(eq(patronageMilestones.merchantId, merchantId));
}

export async function createMilestone(data: InsertPatronageMilestone): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [row] = await db.insert(patronageMilestones).values(data).returning({ id: patronageMilestones.id });
  return row!.id;
}

export async function deleteMilestone(id: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(patronageMilestones).where(eq(patronageMilestones.id, id));
}

// ─── Platform Admins (owned here) ──────────────────────────────────────────────

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(platformAdmins).where(eq(platformAdmins.userId, userId)).limit(1);
  return result.length > 0;
}

export async function grantPlatformAdmin(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(platformAdmins).values({ userId }).onConflictDoNothing();
}

// ─── Platform Analytics ─────────────────────────────────────────────────────────

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { totalMembers: 0, totalMerchants: 0, liveMerchants: 0, totalPointsIssued: 0, totalRedemptions: 0 };

  const [memberCount] = await db.select({ count: sql<number>`count(*)` }).from(members);
  const [merchantCount] = await db.select({ count: sql<number>`count(*)` }).from(merchants);
  const [liveMerchantCount] = await db.select({ count: sql<number>`count(*)` }).from(merchants).where(eq(merchants.isLive, true));
  const [pointsSum] = await db
    .select({ total: sql<number>`COALESCE(SUM(points), 0)` })
    .from(pointsLedger)
    .where(eq(pointsLedger.type, "earn"));
  const [redemptionCount] = await db.select({ count: sql<number>`count(*)` }).from(redemptions).where(eq(redemptions.status, "confirmed"));

  return {
    totalMembers: Number(memberCount?.count ?? 0),
    totalMerchants: Number(merchantCount?.count ?? 0),
    liveMerchants: Number(liveMerchantCount?.count ?? 0),
    totalPointsIssued: Number(pointsSum?.total ?? 0),
    totalRedemptions: Number(redemptionCount?.count ?? 0),
  };
}

export async function getMerchantStats(merchantId: string) {
  const db = await getDb();
  if (!db) return { customerCount: 0, pointsIssued: 0, redemptionCount: 0, activeOffers: 0 };

  const [accountCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(loyaltyAccounts)
    .where(eq(loyaltyAccounts.merchantId, merchantId));
  const [pointsSum] = await db
    .select({ total: sql<number>`COALESCE(SUM(${pointsLedger.points}), 0)` })
    .from(pointsLedger)
    .innerJoin(loyaltyAccounts, eq(loyaltyAccounts.id, pointsLedger.loyaltyAccountId))
    .where(and(eq(loyaltyAccounts.merchantId, merchantId), eq(pointsLedger.type, "earn")));
  const [redemptionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(redemptions)
    .where(and(eq(redemptions.merchantId, merchantId), eq(redemptions.status, "confirmed")));
  const [offerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(and(eq(offers.merchantId, merchantId), eq(offers.isActive, true)));

  return {
    customerCount: Number(accountCount?.count ?? 0),
    pointsIssued: Number(pointsSum?.total ?? 0),
    redemptionCount: Number(redemptionCount?.count ?? 0),
    activeOffers: Number(offerCount?.count ?? 0),
  };
}

export async function getMerchantCustomers(merchantId: string): Promise<{ member: Member; account: LoyaltyAccount }[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ account: loyaltyAccounts, member: members })
    .from(loyaltyAccounts)
    .innerJoin(members, eq(members.id, loyaltyAccounts.memberId))
    .where(eq(loyaltyAccounts.merchantId, merchantId))
    .orderBy(desc(loyaltyAccounts.enrolledAt));
  return rows.map((r) => ({ member: r.member, account: r.account }));
}
