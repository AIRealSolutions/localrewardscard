import {
  bigint,
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["consumer", "business_owner", "admin"]).default("consumer").notNull(),
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Businesses ───────────────────────────────────────────────────────────────
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 128 }).unique(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 64 }),
  zip: varchar("zip", { length: 16 }),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  logoUrl: text("logoUrl"),
  coverImageUrl: text("coverImageUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  magicfishbowlId: varchar("magicfishbowlId", { length: 128 }),
  magicfishbowlSynced: boolean("magicfishbowlSynced").default(false).notNull(),
  pointsPerDollar: decimal("pointsPerDollar", { precision: 10, scale: 2 }).default("1.00").notNull(),
  pointsPerVisit: int("pointsPerVisit").default(0).notNull(),
  pointsExpireDays: int("pointsExpireDays").default(0), // 0 = never
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Loyalty Cards ────────────────────────────────────────────────────────────
export const loyaltyCards = mysqlTable("loyalty_cards", {
  id: int("id").autoincrement().primaryKey(),
  consumerId: int("consumerId").notNull(),
  businessId: int("businessId").notNull(),
  pointsBalance: int("pointsBalance").default(0).notNull(),
  lifetimePoints: int("lifetimePoints").default(0).notNull(),
  visitCount: int("visitCount").default(0).notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  cardNumber: varchar("cardNumber", { length: 32 }).unique(),
  isActive: boolean("isActive").default(true).notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyCard = typeof loyaltyCards.$inferSelect;
export type InsertLoyaltyCard = typeof loyaltyCards.$inferInsert;

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  cardId: int("cardId").notNull(),
  businessId: int("businessId").notNull(),
  consumerId: int("consumerId").notNull(),
  type: mysqlEnum("type", ["earn", "redeem", "bonus", "expire", "adjustment"]).notNull(),
  points: int("points").notNull(), // positive = earn, negative = redeem/expire
  amountSpent: decimal("amountSpent", { precision: 10, scale: 2 }),
  description: text("description"),
  referenceId: varchar("referenceId", { length: 128 }), // offer or campaign id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ─── Rewards Offers ───────────────────────────────────────────────────────────
export const rewardsOffers = mysqlTable("rewards_offers", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pointsRequired: int("pointsRequired").notNull(),
  discountType: mysqlEnum("discountType", ["percent", "fixed", "freebie", "service"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }),
  discountDescription: text("discountDescription"),
  maxRedemptions: int("maxRedemptions"), // null = unlimited
  redemptionsUsed: int("redemptionsUsed").default(0).notNull(),
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RewardsOffer = typeof rewardsOffers.$inferSelect;
export type InsertRewardsOffer = typeof rewardsOffers.$inferInsert;

// ─── Patronage Milestones ─────────────────────────────────────────────────────
export const patronageMilestones = mysqlTable("patronage_milestones", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  visitCount: int("visitCount").notNull(), // trigger at this visit number
  title: varchar("title", { length: 255 }).notNull(),
  rewardDescription: text("rewardDescription"),
  bonusPoints: int("bonusPoints").default(0).notNull(),
  offerId: int("offerId"), // optional linked offer
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PatronageMilestone = typeof patronageMilestones.$inferSelect;
export type InsertPatronageMilestone = typeof patronageMilestones.$inferInsert;

// ─── Redemptions ──────────────────────────────────────────────────────────────
export const redemptions = mysqlTable("redemptions", {
  id: int("id").autoincrement().primaryKey(),
  cardId: int("cardId").notNull(),
  offerId: int("offerId").notNull(),
  consumerId: int("consumerId").notNull(),
  businessId: int("businessId").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  pointsSpent: int("pointsSpent").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 16 }),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  expiresAt: timestamp("expiresAt"),
});

export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = typeof redemptions.$inferInsert;

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  type: mysqlEnum("type", ["email", "sms", "social"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  socialPlatform: varchar("socialPlatform", { length: 64 }),
  status: mysqlEnum("status", ["draft", "scheduled", "sent", "failed"]).default("draft").notNull(),
  recipientCount: int("recipientCount").default(0).notNull(),
  openCount: int("openCount").default(0).notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─── Campaign Recipients ──────────────────────────────────────────────────────
export const campaignRecipients = mysqlTable("campaign_recipients", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  consumerId: int("consumerId").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "opened", "failed"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
});

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;

// ─── Business Accrual Rules ───────────────────────────────────────────────────
export const accrualRules = mysqlTable("accrual_rules", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull().unique(),
  pointsPerDollar: decimal("pointsPerDollar", { precision: 10, scale: 2 }).default("1.00").notNull(),
  pointsPerVisit: int("pointsPerVisit").default(0).notNull(),
  bonusMultiplier: decimal("bonusMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  tierThresholds: json("tierThresholds"), // { silver: 500, gold: 1500, platinum: 5000 }
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccrualRule = typeof accrualRules.$inferSelect;
export type InsertAccrualRule = typeof accrualRules.$inferInsert;
