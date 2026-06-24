CREATE TABLE `accrual_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`pointsPerDollar` decimal(10,2) NOT NULL DEFAULT '1.00',
	`pointsPerVisit` int NOT NULL DEFAULT 0,
	`bonusMultiplier` decimal(5,2) NOT NULL DEFAULT '1.00',
	`tierThresholds` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accrual_rules_id` PRIMARY KEY(`id`),
	CONSTRAINT `accrual_rules_businessId_unique` UNIQUE(`businessId`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(128),
	`description` text,
	`category` varchar(128),
	`address` text,
	`city` varchar(128),
	`state` varchar(64),
	`zip` varchar(16),
	`phone` varchar(32),
	`email` varchar(320),
	`website` text,
	`logoUrl` text,
	`coverImageUrl` text,
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`magicfishbowlId` varchar(128),
	`magicfishbowlSynced` boolean NOT NULL DEFAULT false,
	`pointsPerDollar` decimal(10,2) NOT NULL DEFAULT '1.00',
	`pointsPerVisit` int NOT NULL DEFAULT 0,
	`pointsExpireDays` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`),
	CONSTRAINT `businesses_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `campaign_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`consumerId` int NOT NULL,
	`status` enum('pending','sent','opened','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	CONSTRAINT `campaign_recipients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`type` enum('email','sms','social') NOT NULL,
	`subject` varchar(255),
	`body` text NOT NULL,
	`socialPlatform` varchar(64),
	`status` enum('draft','scheduled','sent','failed') NOT NULL DEFAULT 'draft',
	`recipientCount` int NOT NULL DEFAULT 0,
	`openCount` int NOT NULL DEFAULT 0,
	`scheduledAt` timestamp,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyalty_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`consumerId` int NOT NULL,
	`businessId` int NOT NULL,
	`pointsBalance` int NOT NULL DEFAULT 0,
	`lifetimePoints` int NOT NULL DEFAULT 0,
	`visitCount` int NOT NULL DEFAULT 0,
	`tier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
	`cardNumber` varchar(32),
	`isActive` boolean NOT NULL DEFAULT true,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyalty_cards_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyalty_cards_cardNumber_unique` UNIQUE(`cardNumber`)
);
--> statement-breakpoint
CREATE TABLE `patronage_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`visitCount` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`rewardDescription` text,
	`bonusPoints` int NOT NULL DEFAULT 0,
	`offerId` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patronage_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardId` int NOT NULL,
	`offerId` int NOT NULL,
	`consumerId` int NOT NULL,
	`businessId` int NOT NULL,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`pointsSpent` int NOT NULL,
	`confirmationCode` varchar(16),
	`redeemedAt` timestamp NOT NULL DEFAULT (now()),
	`confirmedAt` timestamp,
	`expiresAt` timestamp,
	CONSTRAINT `redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewards_offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`pointsRequired` int NOT NULL,
	`discountType` enum('percent','fixed','freebie','service') NOT NULL,
	`discountValue` decimal(10,2),
	`discountDescription` text,
	`maxRedemptions` int,
	`redemptionsUsed` int NOT NULL DEFAULT 0,
	`validFrom` timestamp,
	`validUntil` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rewards_offers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cardId` int NOT NULL,
	`businessId` int NOT NULL,
	`consumerId` int NOT NULL,
	`type` enum('earn','redeem','bonus','expire','adjustment') NOT NULL,
	`points` int NOT NULL,
	`amountSpent` decimal(10,2),
	`description` text,
	`referenceId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('consumer','business_owner','admin') NOT NULL DEFAULT 'consumer';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;