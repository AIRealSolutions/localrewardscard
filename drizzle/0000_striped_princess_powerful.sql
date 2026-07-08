CREATE TYPE "public"."business_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."campaign_recipient_status" AS ENUM('pending', 'sent', 'opened', 'failed');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('email', 'sms', 'social');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percent', 'fixed', 'freebie', 'service');--> statement-breakpoint
CREATE TYPE "public"."loyalty_tier" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TYPE "public"."redemption_status" AS ENUM('pending', 'confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('earn', 'redeem', 'bonus', 'expire', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('consumer', 'business_owner', 'admin');--> statement-breakpoint
CREATE TABLE "accrual_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"pointsPerDollar" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"pointsPerVisit" integer DEFAULT 0 NOT NULL,
	"bonusMultiplier" numeric(5, 2) DEFAULT '1.00' NOT NULL,
	"tierThresholds" json,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accrual_rules_businessId_unique" UNIQUE("businessId")
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(128),
	"description" text,
	"category" varchar(128),
	"address" text,
	"city" varchar(128),
	"state" varchar(64),
	"zip" varchar(16),
	"phone" varchar(32),
	"email" varchar(320),
	"website" text,
	"logoUrl" text,
	"coverImageUrl" text,
	"status" "business_status" DEFAULT 'pending' NOT NULL,
	"magicfishbowlId" varchar(128),
	"magicfishbowlSynced" boolean DEFAULT false NOT NULL,
	"pointsPerDollar" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"pointsPerVisit" integer DEFAULT 0 NOT NULL,
	"pointsExpireDays" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaignId" integer NOT NULL,
	"consumerId" integer NOT NULL,
	"status" "campaign_recipient_status" DEFAULT 'pending' NOT NULL,
	"sentAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"type" "campaign_type" NOT NULL,
	"subject" varchar(255),
	"body" text NOT NULL,
	"socialPlatform" varchar(64),
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"recipientCount" integer DEFAULT 0 NOT NULL,
	"openCount" integer DEFAULT 0 NOT NULL,
	"scheduledAt" timestamp,
	"sentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"consumerId" integer NOT NULL,
	"businessId" integer NOT NULL,
	"pointsBalance" integer DEFAULT 0 NOT NULL,
	"lifetimePoints" integer DEFAULT 0 NOT NULL,
	"visitCount" integer DEFAULT 0 NOT NULL,
	"tier" "loyalty_tier" DEFAULT 'bronze' NOT NULL,
	"cardNumber" varchar(32),
	"isActive" boolean DEFAULT true NOT NULL,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_cards_cardNumber_unique" UNIQUE("cardNumber")
);
--> statement-breakpoint
CREATE TABLE "patronage_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"visitCount" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"rewardDescription" text,
	"bonusPoints" integer DEFAULT 0 NOT NULL,
	"offerId" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redemptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"cardId" integer NOT NULL,
	"offerId" integer NOT NULL,
	"consumerId" integer NOT NULL,
	"businessId" integer NOT NULL,
	"status" "redemption_status" DEFAULT 'pending' NOT NULL,
	"pointsSpent" integer NOT NULL,
	"confirmationCode" varchar(16),
	"redeemedAt" timestamp DEFAULT now() NOT NULL,
	"confirmedAt" timestamp,
	"expiresAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "rewards_offers" (
	"id" serial PRIMARY KEY NOT NULL,
	"businessId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"pointsRequired" integer NOT NULL,
	"discountType" "discount_type" NOT NULL,
	"discountValue" numeric(10, 2),
	"discountDescription" text,
	"maxRedemptions" integer,
	"redemptionsUsed" integer DEFAULT 0 NOT NULL,
	"validFrom" timestamp,
	"validUntil" timestamp,
	"isActive" boolean DEFAULT true NOT NULL,
	"imageUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"cardId" integer NOT NULL,
	"businessId" integer NOT NULL,
	"consumerId" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"points" integer NOT NULL,
	"amountSpent" numeric(10, 2),
	"description" text,
	"referenceId" varchar(128),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(32),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'consumer' NOT NULL,
	"onboardingComplete" boolean DEFAULT false NOT NULL,
	"avatarUrl" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
