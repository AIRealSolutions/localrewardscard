import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// ─── Auth ─────────────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        role: z.enum(["consumer", "business_owner"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db.updateUserOnboarding(ctx.user.id, {
        name: input.name,
        phone: input.phone,
        role: input.role,
        onboardingComplete: true,
      });
      return { success: true };
    }),
});

// ─── Business ─────────────────────────────────────────────────────────────────
const businessRouter = router({
  getMyBusiness: protectedProcedure.query(async ({ ctx }) => {
    return db.getBusinessByOwnerId(ctx.user.id);
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return db.getBusinessById(input.id);
  }),

  getApproved: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getApprovedBusinesses(input.limit, input.offset);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional().or(z.literal("")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await db.getBusinessByOwnerId(ctx.user.id);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "You already have a registered business." });

      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 128);

      const id = await db.createBusiness({
        ownerId: ctx.user.id,
        name: input.name,
        slug: `${slug}-${nanoid(6)}`,
        description: input.description,
        category: input.category,
        address: input.address,
        city: input.city,
        state: input.state,
        zip: input.zip,
        phone: input.phone,
        email: input.email,
        website: input.website || undefined,
        status: "pending",
      });

      // Default accrual rule
      await db.upsertAccrualRule({
        businessId: id,
        pointsPerDollar: "1.00",
        pointsPerVisit: 0,
        bonusMultiplier: "1.00",
        tierThresholds: JSON.stringify({ silver: 500, gold: 1500, platinum: 5000 }),
      });

      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        coverImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      await db.updateBusiness(biz.id, input);
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const biz = await db.getBusinessByOwnerId(ctx.user.id);
    if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
    return db.getBusinessStats(biz.id);
  }),

  getCustomers: protectedProcedure.query(async ({ ctx }) => {
    const biz = await db.getBusinessByOwnerId(ctx.user.id);
    if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
    return db.getBusinessCustomers(biz.id);
  }),

  issuePoints: protectedProcedure
    .input(
      z.object({
        consumerId: z.number(),
        points: z.number().positive(),
        amountSpent: z.number().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      if (biz.status !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "Business not approved." });

      const card = await db.getOrCreateLoyaltyCard(input.consumerId, biz.id);
      const newBalance = card.pointsBalance + input.points;
      const newLifetime = card.lifetimePoints + input.points;
      const newVisits = card.visitCount + 1;

      // Determine tier
      let tier = card.tier;
      const rule = await db.getAccrualRule(biz.id);
      const thresholds = rule?.tierThresholds
        ? (typeof rule.tierThresholds === "string" ? JSON.parse(rule.tierThresholds) : rule.tierThresholds) as { silver: number; gold: number; platinum: number }
        : { silver: 500, gold: 1500, platinum: 5000 };

      if (newLifetime >= thresholds.platinum) tier = "platinum";
      else if (newLifetime >= thresholds.gold) tier = "gold";
      else if (newLifetime >= thresholds.silver) tier = "silver";
      else tier = "bronze";

      await db.updateLoyaltyCard(card.id, {
        pointsBalance: newBalance,
        lifetimePoints: newLifetime,
        visitCount: newVisits,
        tier,
      });

      await db.createTransaction({
        cardId: card.id,
        businessId: biz.id,
        consumerId: input.consumerId,
        type: "earn",
        points: input.points,
        amountSpent: input.amountSpent?.toString(),
        description: input.description ?? `Points issued by ${biz.name}`,
      });

      // Check milestones
      const milestones = await db.getMilestonesByBusiness(biz.id);
      for (const milestone of milestones) {
        if (milestone.isActive && milestone.visitCount === newVisits && milestone.bonusPoints > 0) {
          await db.updateLoyaltyCard(card.id, { pointsBalance: newBalance + milestone.bonusPoints });
          await db.createTransaction({
            cardId: card.id,
            businessId: biz.id,
            consumerId: input.consumerId,
            type: "bonus",
            points: milestone.bonusPoints,
            description: `Milestone: ${milestone.title}`,
          });
        }
      }

      return { success: true, newBalance, tier };
    }),
});

// ─── Consumer ─────────────────────────────────────────────────────────────────
const consumerRouter = router({
  getMyCards: protectedProcedure.query(async ({ ctx }) => {
    const cards = await db.getLoyaltyCardsByConsumer(ctx.user.id);
    const enriched = await Promise.all(
      cards.map(async (card) => {
        const business = await db.getBusinessById(card.businessId);
        return { card, business };
      })
    );
    return enriched.filter((e) => e.business);
  }),

  getTransactions: protectedProcedure
    .input(z.object({ cardId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const cards = await db.getLoyaltyCardsByConsumer(ctx.user.id);
      const card = cards.find((c) => c.id === input.cardId);
      if (!card) throw new TRPCError({ code: "FORBIDDEN" });
      return db.getTransactionsByCard(input.cardId);
    }),

  getAvailableOffers: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ ctx, input }) => {
      const cards = await db.getLoyaltyCardsByConsumer(ctx.user.id);
      const card = cards.find((c) => c.businessId === input.businessId);
      const offers = await db.getActiveOffersByBusiness(input.businessId);
      return { offers, card };
    }),

  redeemOffer: protectedProcedure
    .input(z.object({ offerId: z.number(), businessId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const cards = await db.getLoyaltyCardsByConsumer(ctx.user.id);
      const card = cards.find((c) => c.businessId === input.businessId);
      if (!card) throw new TRPCError({ code: "NOT_FOUND", message: "No loyalty card for this business." });

      const offers = await db.getActiveOffersByBusiness(input.businessId);
      const offer = offers.find((o) => o.id === input.offerId);
      if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Offer not found." });
      if (card.pointsBalance < offer.pointsRequired) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points." });
      }

      const confirmationCode = nanoid(8).toUpperCase();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const redemptionId = await db.createRedemption({
        cardId: card.id,
        offerId: offer.id,
        consumerId: ctx.user.id,
        businessId: input.businessId,
        pointsSpent: offer.pointsRequired,
        confirmationCode,
        expiresAt,
      });

      // Deduct points
      await db.updateLoyaltyCard(card.id, {
        pointsBalance: card.pointsBalance - offer.pointsRequired,
      });

      await db.createTransaction({
        cardId: card.id,
        businessId: input.businessId,
        consumerId: ctx.user.id,
        type: "redeem",
        points: -offer.pointsRequired,
        description: `Redeemed: ${offer.title}`,
        referenceId: String(redemptionId),
      });

      return { redemptionId, confirmationCode };
    }),

  getRedemptions: protectedProcedure.query(async ({ ctx }) => {
    return db.getRedemptionsByConsumer(ctx.user.id);
  }),
});

// ─── Offers ───────────────────────────────────────────────────────────────────
const offersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const biz = await db.getBusinessByOwnerId(ctx.user.id);
    if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
    return db.getOffersByBusiness(biz.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        pointsRequired: z.number().positive(),
        discountType: z.enum(["percent", "fixed", "freebie", "service"]),
        discountValue: z.number().optional(),
        discountDescription: z.string().optional(),
        maxRedemptions: z.number().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      const id = await db.createRewardsOffer({
        businessId: biz.id,
        ...input,
        discountValue: input.discountValue?.toString(),
      });
      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        pointsRequired: z.number().positive().optional(),
        isActive: z.boolean().optional(),
        discountValue: z.number().optional(),
        discountDescription: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      await db.updateRewardsOffer(id, {
        ...data,
        discountValue: data.discountValue?.toString(),
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      await db.deleteRewardsOffer(input.id);
      return { success: true };
    }),
});

// ─── Milestones ───────────────────────────────────────────────────────────────
const milestonesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const biz = await db.getBusinessByOwnerId(ctx.user.id);
    if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
    return db.getMilestonesByBusiness(biz.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        visitCount: z.number().positive(),
        title: z.string().min(1),
        rewardDescription: z.string().optional(),
        bonusPoints: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      const id = await db.createMilestone({ businessId: biz.id, ...input });
      return { id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.deleteMilestone(input.id);
      return { success: true };
    }),
});

// ─── Accrual Rules ────────────────────────────────────────────────────────────
const accrualRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const biz = await db.getBusinessByOwnerId(ctx.user.id);
    if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
    return db.getAccrualRule(biz.id);
  }),

  update: protectedProcedure
    .input(
      z.object({
        pointsPerDollar: z.number().positive(),
        pointsPerVisit: z.number().min(0),
        bonusMultiplier: z.number().positive(),
        tierThresholds: z
          .object({
            silver: z.number(),
            gold: z.number(),
            platinum: z.number(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      await db.upsertAccrualRule({
        businessId: biz.id,
        pointsPerDollar: input.pointsPerDollar.toString(),
        pointsPerVisit: input.pointsPerVisit,
        bonusMultiplier: input.bonusMultiplier.toString(),
        tierThresholds: input.tierThresholds ? JSON.stringify(input.tierThresholds) : undefined,
      });
      return { success: true };
    }),
});

// ─── Campaigns ────────────────────────────────────────────────────────────────
const campaignsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const biz = await db.getBusinessByOwnerId(ctx.user.id);
    if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
    return db.getCampaignsByBusiness(biz.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["email", "sms", "social"]),
        subject: z.string().optional(),
        body: z.string().min(1),
        socialPlatform: z.string().optional(),
        scheduledAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });

      const customers = await db.getBusinessCustomers(biz.id);
      const id = await db.createCampaign({
        businessId: biz.id,
        ...input,
        status: input.scheduledAt ? "scheduled" : "draft",
        recipientCount: customers.length,
      });
      return { id };
    }),

  send: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      // Mark as sent (actual sending would integrate with email/SMS provider)
      await db.updateCampaign(input.id, { status: "sent", sentAt: new Date() });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const biz = await db.getBusinessByOwnerId(ctx.user.id);
      if (!biz) throw new TRPCError({ code: "NOT_FOUND" });
      await db.updateCampaign(input.id, { status: "failed" });
      return { success: true };
    }),
});

// ─── Admin ────────────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    return db.getPlatformStats();
  }),

  getAllBusinesses: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getAllBusinesses(input.limit, input.offset);
    }),

  getPendingBusinesses: adminProcedure.query(async () => {
    return db.getPendingBusinesses();
  }),

  approveBusiness: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateBusiness(input.id, { status: "approved" });
      return { success: true };
    }),

  rejectBusiness: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      await db.updateBusiness(input.id, { status: "rejected" });
      return { success: true };
    }),

  suspendBusiness: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateBusiness(input.id, { status: "suspended" });
      return { success: true };
    }),

  getAllUsers: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getAllUsers(input.limit, input.offset);
    }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["consumer", "business_owner", "admin"]) }))
    .mutation(async ({ input }) => {
      await db.updateUserOnboarding(input.userId, { role: input.role });
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  business: businessRouter,
  consumer: consumerRouter,
  offers: offersRouter,
  milestones: milestonesRouter,
  accrual: accrualRouter,
  campaigns: campaignsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
