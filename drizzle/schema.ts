import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────────────────────────────────────
// Tables below this line are owned by the `magicfishbowl` repo
// (supabase/schema.sql there is the source of truth — do not run drizzle-kit
// push/generate against this database from this repo). These declarations
// only cover the columns Local Rewards Card actually reads/writes.
// ─────────────────────────────────────────────────────────────────────────────

export const subscriptionTierEnum = pgEnum("subscription_tier", ["starter", "pro", "agency"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["trialing", "active", "past_due", "canceled"]);
export const offerTypeEnum = pgEnum("offer_type", ["giveaway", "discount"]);
export const redemptionStatusEnum = pgEnum("redemption_status", ["pending_pin", "confirmed", "flagged"]);
export const campaignTypeEnum = pgEnum("campaign_type", ["email", "sms", "social"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed"]);

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  fullName: text("full_name").notNull(),
  qrToken: text("qr_token").notNull(),
  nfcToken: text("nfc_token").notNull(),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Member = typeof members.$inferSelect;

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerUserId: uuid("owner_user_id").notNull(),
  businessName: text("business_name").notNull(),
  category: text("category").notNull(),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  logoUrl: text("logo_url"),
  hours: jsonb("hours"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("starter"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default("trialing"),
  isLive: boolean("is_live").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Merchant = typeof merchants.$inferSelect;

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  offerType: offerTypeEnum("offer_type").notNull().default("giveaway"),
  discountValue: doublePrecision("discount_value"),
  maxTotalUses: integer("max_total_uses"),
  perMemberLimit: integer("per_member_limit").notNull().default(1),
  cooldownDays: integer("cooldown_days").notNull().default(30),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  totalRedeemed: integer("total_redeemed").notNull().default(0),
  pointsRequired: integer("points_required"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

export const redemptions = pgTable("redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").notNull(),
  merchantId: uuid("merchant_id").notNull(),
  offerId: uuid("offer_id").notNull(),
  staffId: uuid("staff_id"),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  status: redemptionStatusEnum("status").notNull().default("pending_pin"),
});

export type Redemption = typeof redemptions.$inferSelect;

export const crmContacts = pgTable("crm_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  memberId: uuid("member_id"),
  email: text("email").notNull(),
  phone: text("phone"),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CrmContact = typeof crmContacts.$inferSelect;
export type InsertCrmContact = typeof crmContacts.$inferInsert;

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  name: text("name").notNull(),
  type: campaignTypeEnum("type").notNull().default("email"),
  status: campaignStatusEnum("status").notNull().default("draft"),
  trigger: jsonb("trigger").notNull(),
  steps: jsonb("steps").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// Tables below this line are owned by this repo (Local Rewards Card's
// additive loyalty layer — see the `local_rewards_loyalty_layer` migration
// applied directly via the Supabase MCP, not drizzle-kit).
// ─────────────────────────────────────────────────────────────────────────────

export const loyaltyTierEnum = pgEnum("loyalty_tier", ["bronze", "silver", "gold", "platinum"]);
export const pointsTransactionTypeEnum = pgEnum("points_transaction_type", ["earn", "redeem", "bonus", "expire", "adjustment"]);

export const loyaltyAccounts = pgTable("loyalty_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  memberId: uuid("member_id").notNull(),
  merchantId: uuid("merchant_id").notNull(),
  pointsBalance: integer("points_balance").notNull().default(0),
  lifetimePoints: integer("lifetime_points").notNull().default(0),
  visitCount: integer("visit_count").notNull().default(0),
  tier: loyaltyTierEnum("tier").notNull().default("bronze"),
  enrolledAt: timestamp("enrolled_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LoyaltyAccount = typeof loyaltyAccounts.$inferSelect;
export type InsertLoyaltyAccount = typeof loyaltyAccounts.$inferInsert;

export const pointsLedger = pgTable("points_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  loyaltyAccountId: uuid("loyalty_account_id").notNull(),
  redemptionId: uuid("redemption_id"),
  type: pointsTransactionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  amountSpent: numeric("amount_spent", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PointsLedgerEntry = typeof pointsLedger.$inferSelect;
export type InsertPointsLedgerEntry = typeof pointsLedger.$inferInsert;

export const merchantAccrualRules = pgTable("merchant_accrual_rules", {
  merchantId: uuid("merchant_id").primaryKey(),
  pointsPerDollar: numeric("points_per_dollar", { precision: 10, scale: 2 }).notNull().default("1.00"),
  pointsPerVisit: integer("points_per_visit").notNull().default(0),
  bonusMultiplier: numeric("bonus_multiplier", { precision: 5, scale: 2 }).notNull().default("1.00"),
  tierThresholds: jsonb("tier_thresholds"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MerchantAccrualRule = typeof merchantAccrualRules.$inferSelect;
export type InsertMerchantAccrualRule = typeof merchantAccrualRules.$inferInsert;

export const patronageMilestones = pgTable("patronage_milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull(),
  visitCount: integer("visit_count").notNull(),
  title: text("title").notNull(),
  rewardDescription: text("reward_description"),
  bonusPoints: integer("bonus_points").notNull().default(0),
  offerId: uuid("offer_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PatronageMilestone = typeof patronageMilestones.$inferSelect;
export type InsertPatronageMilestone = typeof patronageMilestones.$inferInsert;

export const platformAdmins = pgTable("platform_admins", {
  userId: uuid("user_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PlatformAdmin = typeof platformAdmins.$inferSelect;
