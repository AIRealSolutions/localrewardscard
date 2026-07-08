import {
  boolean,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["consumer", "business_owner", "admin"]);
export const businessStatusEnum = pgEnum("business_status", ["pending", "approved", "rejected", "suspended"]);
export const loyaltyTierEnum = pgEnum("loyalty_tier", ["bronze", "silver", "gold", "platinum"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["earn", "redeem", "bonus", "expire", "adjustment"]);
export const discountTypeEnum = pgEnum("discount_type", ["percent", "fixed", "freebie", "service"]);
export const redemptionStatusEnum = pgEnum("redemption_status", ["pending", "confirmed", "cancelled"]);
export const campaignTypeEnum = pgEnum("campaign_type", ["email", "sms", "social"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "sent", "failed"]);
export const campaignRecipientStatusEnum = pgEnum("campaign_recipient_status", ["pending", "sent", "opened", "failed"]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("consumer").notNull(),
  onboardingComplete: boolean("onboardingComplete").default(false).notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Businesses ───────────────────────────────────────────────────────────────
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  ownerId: integer("ownerId").notNull(),
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
  status: businessStatusEnum("status").default("pending").notNull(),
  magicfishbowlId: varchar("magicfishbowlId", { length: 128 }),
  magicfishbowlSynced: boolean("magicfishbowlSynced").default(false).notNull(),
  pointsPerDollar: numeric("pointsPerDollar", { precision: 10, scale: 2 }).default("1.00").notNull(),
  pointsPerVisit: integer("pointsPerVisit").default(0).notNull(),
  pointsExpireDays: integer("pointsExpireDays").default(0), // 0 = never
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;

// ─── Loyalty Cards ────────────────────────────────────────────────────────────
export const loyaltyCards = pgTable("loyalty_cards", {
  id: serial("id").primaryKey(),
  consumerId: integer("consumerId").notNull(),
  businessId: integer("businessId").notNull(),
  pointsBalance: integer("pointsBalance").default(0).notNull(),
  lifetimePoints: integer("lifetimePoints").default(0).notNull(),
  visitCount: integer("visitCount").default(0).notNull(),
  tier: loyaltyTierEnum("tier").default("bronze").notNull(),
  cardNumber: varchar("cardNumber", { length: 32 }).unique(),
  isActive: boolean("isActive").default(true).notNull(),
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LoyaltyCard = typeof loyaltyCards.$inferSelect;
export type InsertLoyaltyCard = typeof loyaltyCards.$inferInsert;

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  cardId: integer("cardId").notNull(),
  businessId: integer("businessId").notNull(),
  consumerId: integer("consumerId").notNull(),
  type: transactionTypeEnum("type").notNull(),
  points: integer("points").notNull(), // positive = earn, negative = redeem/expire
  amountSpent: numeric("amountSpent", { precision: 10, scale: 2 }),
  description: text("description"),
  referenceId: varchar("referenceId", { length: 128 }), // offer or campaign id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// ─── Rewards Offers ───────────────────────────────────────────────────────────
export const rewardsOffers = pgTable("rewards_offers", {
  id: serial("id").primaryKey(),
  businessId: integer("businessId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pointsRequired: integer("pointsRequired").notNull(),
  discountType: discountTypeEnum("discountType").notNull(),
  discountValue: numeric("discountValue", { precision: 10, scale: 2 }),
  discountDescription: text("discountDescription"),
  maxRedemptions: integer("maxRedemptions"), // null = unlimited
  redemptionsUsed: integer("redemptionsUsed").default(0).notNull(),
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  isActive: boolean("isActive").default(true).notNull(),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RewardsOffer = typeof rewardsOffers.$inferSelect;
export type InsertRewardsOffer = typeof rewardsOffers.$inferInsert;

// ─── Patronage Milestones ─────────────────────────────────────────────────────
export const patronageMilestones = pgTable("patronage_milestones", {
  id: serial("id").primaryKey(),
  businessId: integer("businessId").notNull(),
  visitCount: integer("visitCount").notNull(), // trigger at this visit number
  title: varchar("title", { length: 255 }).notNull(),
  rewardDescription: text("rewardDescription"),
  bonusPoints: integer("bonusPoints").default(0).notNull(),
  offerId: integer("offerId"), // optional linked offer
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PatronageMilestone = typeof patronageMilestones.$inferSelect;
export type InsertPatronageMilestone = typeof patronageMilestones.$inferInsert;

// ─── Redemptions ──────────────────────────────────────────────────────────────
export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  cardId: integer("cardId").notNull(),
  offerId: integer("offerId").notNull(),
  consumerId: integer("consumerId").notNull(),
  businessId: integer("businessId").notNull(),
  status: redemptionStatusEnum("status").default("pending").notNull(),
  pointsSpent: integer("pointsSpent").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 16 }),
  redeemedAt: timestamp("redeemedAt").defaultNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  expiresAt: timestamp("expiresAt"),
});

export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = typeof redemptions.$inferInsert;

// ─── Campaigns ────────────────────────────────────────────────────────────────
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  businessId: integer("businessId").notNull(),
  type: campaignTypeEnum("type").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  socialPlatform: varchar("socialPlatform", { length: 64 }),
  status: campaignStatusEnum("status").default("draft").notNull(),
  recipientCount: integer("recipientCount").default(0).notNull(),
  openCount: integer("openCount").default(0).notNull(),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─── Campaign Recipients ──────────────────────────────────────────────────────
export const campaignRecipients = pgTable("campaign_recipients", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaignId").notNull(),
  consumerId: integer("consumerId").notNull(),
  status: campaignRecipientStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sentAt"),
});

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;

// ─── Business Accrual Rules ───────────────────────────────────────────────────
export const accrualRules = pgTable("accrual_rules", {
  id: serial("id").primaryKey(),
  businessId: integer("businessId").notNull().unique(),
  pointsPerDollar: numeric("pointsPerDollar", { precision: 10, scale: 2 }).default("1.00").notNull(),
  pointsPerVisit: integer("pointsPerVisit").default(0).notNull(),
  bonusMultiplier: numeric("bonusMultiplier", { precision: 5, scale: 2 }).default("1.00").notNull(),
  tierThresholds: json("tierThresholds"), // { silver: 500, gold: 1500, platinum: 5000 }
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AccrualRule = typeof accrualRules.$inferSelect;
export type InsertAccrualRule = typeof accrualRules.$inferInsert;
