import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  AccrualRule,
  Business,
  Campaign,
  InsertAccrualRule,
  InsertBusiness,
  InsertCampaign,
  InsertLoyaltyCard,
  InsertPatronageMilestone,
  InsertRedemption,
  InsertRewardsOffer,
  InsertTransaction,
  InsertUser,
  LoyaltyCard,
  PatronageMilestone,
  Redemption,
  RewardsOffer,
  Transaction,
  User,
  accrualRules,
  businesses,
  campaignRecipients,
  campaigns,
  loyaltyCards,
  patronageMilestones,
  redemptions,
  rewardsOffers,
  transactions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

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

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const fields = ["name", "email", "loginMethod", "phone", "avatarUrl"] as const;
  for (const field of fields) {
    const val = user[field];
    if (val !== undefined) {
      values[field] = val ?? null;
      updateSet[field] = val ?? null;
    }
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (ENV.ownerEmail && user.email === ENV.ownerEmail) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserOnboarding(
  userId: number,
  data: { name?: string; phone?: string; role?: "consumer" | "business_owner" | "admin"; onboardingComplete?: boolean }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function getAllUsers(limit = 100, offset = 0): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).limit(limit).offset(offset).orderBy(desc(users.createdAt));
}

// ─── Businesses ───────────────────────────────────────────────────────────────

export async function createBusiness(data: InsertBusiness): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [row] = await db.insert(businesses).values(data).returning({ id: businesses.id });
  return row!.id;
}

export async function getBusinessById(id: number): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result[0];
}

export async function getBusinessByOwnerId(ownerId: number): Promise<Business | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.ownerId, ownerId)).limit(1);
  return result[0];
}

export async function updateBusiness(id: number, data: Partial<InsertBusiness>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(businesses).set({ ...data, updatedAt: new Date() }).where(eq(businesses.id, id));
}

export async function getApprovedBusinesses(limit = 50, offset = 0): Promise<Business[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businesses)
    .where(eq(businesses.status, "approved"))
    .limit(limit)
    .offset(offset)
    .orderBy(desc(businesses.createdAt));
}

export async function getAllBusinesses(limit = 100, offset = 0): Promise<Business[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businesses).limit(limit).offset(offset).orderBy(desc(businesses.createdAt));
}

export async function getPendingBusinesses(): Promise<Business[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(businesses).where(eq(businesses.status, "pending")).orderBy(desc(businesses.createdAt));
}

// ─── Loyalty Cards ────────────────────────────────────────────────────────────

export async function getOrCreateLoyaltyCard(consumerId: number, businessId: number): Promise<LoyaltyCard> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(loyaltyCards)
    .where(and(eq(loyaltyCards.consumerId, consumerId), eq(loyaltyCards.businessId, businessId)))
    .limit(1);

  if (existing[0]) return existing[0];

  const cardNumber = `LR-${Date.now()}-${Math.floor(Math.random() * 9999).toString().padStart(4, "0")}`;
  const [created] = await db.insert(loyaltyCards).values({ consumerId, businessId, cardNumber }).returning();
  return created!;
}

export async function getLoyaltyCardsByConsumer(consumerId: number): Promise<LoyaltyCard[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyCards).where(eq(loyaltyCards.consumerId, consumerId));
}

export async function getLoyaltyCardsByBusiness(businessId: number): Promise<LoyaltyCard[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(loyaltyCards).where(eq(loyaltyCards.businessId, businessId));
}

export async function updateLoyaltyCard(id: number, data: Partial<InsertLoyaltyCard>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(loyaltyCards).set({ ...data, updatedAt: new Date() }).where(eq(loyaltyCards.id, id));
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function createTransaction(data: InsertTransaction): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(transactions).values(data);
}

export async function getTransactionsByCard(cardId: number, limit = 50): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.cardId, cardId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTransactionsByBusiness(businessId: number, limit = 100): Promise<Transaction[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.businessId, businessId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

// ─── Rewards Offers ───────────────────────────────────────────────────────────

export async function createRewardsOffer(data: InsertRewardsOffer): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [row] = await db.insert(rewardsOffers).values(data).returning({ id: rewardsOffers.id });
  return row!.id;
}

export async function getOffersByBusiness(businessId: number): Promise<RewardsOffer[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rewardsOffers).where(eq(rewardsOffers.businessId, businessId)).orderBy(desc(rewardsOffers.createdAt));
}

export async function getActiveOffersByBusiness(businessId: number): Promise<RewardsOffer[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(rewardsOffers)
    .where(and(eq(rewardsOffers.businessId, businessId), eq(rewardsOffers.isActive, true)));
}

export async function updateRewardsOffer(id: number, data: Partial<InsertRewardsOffer>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(rewardsOffers).set({ ...data, updatedAt: new Date() }).where(eq(rewardsOffers.id, id));
}

export async function deleteRewardsOffer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(rewardsOffers).where(eq(rewardsOffers.id, id));
}

// ─── Patronage Milestones ─────────────────────────────────────────────────────

export async function getMilestonesByBusiness(businessId: number): Promise<PatronageMilestone[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(patronageMilestones).where(eq(patronageMilestones.businessId, businessId));
}

export async function createMilestone(data: InsertPatronageMilestone): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [row] = await db.insert(patronageMilestones).values(data).returning({ id: patronageMilestones.id });
  return row!.id;
}

export async function deleteMilestone(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(patronageMilestones).where(eq(patronageMilestones.id, id));
}

// ─── Redemptions ──────────────────────────────────────────────────────────────

export async function createRedemption(data: InsertRedemption): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [row] = await db.insert(redemptions).values(data).returning({ id: redemptions.id });
  return row!.id;
}

export async function getRedemptionsByConsumer(consumerId: number): Promise<Redemption[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(redemptions)
    .where(eq(redemptions.consumerId, consumerId))
    .orderBy(desc(redemptions.redeemedAt));
}

export async function getRedemptionsByBusiness(businessId: number): Promise<Redemption[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(redemptions)
    .where(eq(redemptions.businessId, businessId))
    .orderBy(desc(redemptions.redeemedAt));
}

export async function updateRedemption(id: number, data: Partial<InsertRedemption>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(redemptions).set(data).where(eq(redemptions.id, id));
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function createCampaign(data: InsertCampaign): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [row] = await db.insert(campaigns).values(data).returning({ id: campaigns.id });
  return row!.id;
}

export async function getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(campaigns)
    .where(eq(campaigns.businessId, businessId))
    .orderBy(desc(campaigns.createdAt));
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(campaigns).set({ ...data, updatedAt: new Date() }).where(eq(campaigns.id, id));
}

// ─── Accrual Rules ────────────────────────────────────────────────────────────

export async function getAccrualRule(businessId: number): Promise<AccrualRule | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(accrualRules).where(eq(accrualRules.businessId, businessId)).limit(1);
  return result[0];
}

export async function upsertAccrualRule(data: InsertAccrualRule): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(accrualRules).values(data).onConflictDoUpdate({ target: accrualRules.businessId, set: data });
}

// ─── Platform Analytics ───────────────────────────────────────────────────────

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalBusinesses: 0, totalCards: 0, totalPointsIssued: 0, totalRedemptions: 0 };

  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [bizCount] = await db.select({ count: sql<number>`count(*)` }).from(businesses);
  const [cardCount] = await db.select({ count: sql<number>`count(*)` }).from(loyaltyCards);
  const [pointsSum] = await db
    .select({ total: sql<number>`COALESCE(SUM(points), 0)` })
    .from(transactions)
    .where(eq(transactions.type, "earn"));
  const [redemptionCount] = await db.select({ count: sql<number>`count(*)` }).from(redemptions);

  return {
    totalUsers: Number(userCount?.count ?? 0),
    totalBusinesses: Number(bizCount?.count ?? 0),
    totalCards: Number(cardCount?.count ?? 0),
    totalPointsIssued: Number(pointsSum?.total ?? 0),
    totalRedemptions: Number(redemptionCount?.count ?? 0),
  };
}

export async function getBusinessStats(businessId: number) {
  const db = await getDb();
  if (!db) return { customerCount: 0, pointsIssued: 0, redemptionCount: 0, activeOffers: 0 };

  const [cardCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(loyaltyCards)
    .where(eq(loyaltyCards.businessId, businessId));
  const [pointsSum] = await db
    .select({ total: sql<number>`COALESCE(SUM(points), 0)` })
    .from(transactions)
    .where(and(eq(transactions.businessId, businessId), eq(transactions.type, "earn")));
  const [redemptionCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(redemptions)
    .where(eq(redemptions.businessId, businessId));
  const [offerCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rewardsOffers)
    .where(and(eq(rewardsOffers.businessId, businessId), eq(rewardsOffers.isActive, true)));

  return {
    customerCount: Number(cardCount?.count ?? 0),
    pointsIssued: Number(pointsSum?.total ?? 0),
    redemptionCount: Number(redemptionCount?.count ?? 0),
    activeOffers: Number(offerCount?.count ?? 0),
  };
}

export async function getBusinessCustomers(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  const cards = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.businessId, businessId))
    .orderBy(desc(loyaltyCards.enrolledAt));

  const customerIds = cards.map((c) => c.consumerId);
  if (customerIds.length === 0) return [];

  const customerList = await Promise.all(
    customerIds.map(async (id) => {
      const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const card = cards.find((c) => c.consumerId === id);
      return { user: userResult[0], card };
    })
  );

  return customerList.filter((c) => c.user && c.card);
}
