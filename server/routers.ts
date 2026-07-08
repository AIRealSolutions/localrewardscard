import { TRPCError } from "@trpc/server";
import { z } from "zod";
import type { AuthenticatedUser } from "./_core/auth";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// ─── Auth ─────────────────────────────────────────────────────────────────────
const authRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),
  logout: publicProcedure.mutation(() => {
    // Session is managed client-side by Supabase; nothing to invalidate server-side.
    return { success: true } as const;
  }),
});

// ─── Merchants (read-only — merchants are managed on MagicFishbowl) ───────────
const merchantsRouter = router({
  getById: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input }) => {
    return db.getMerchantById(input.id);
  }),

  getLive: publicProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getLiveMerchants(input.limit, input.offset);
    }),
});

// ─── Consumer ─────────────────────────────────────────────────────────────────
function requireMember(user: AuthenticatedUser) {
  if (!user.member) throw new TRPCError({ code: "NOT_FOUND", message: "No member profile found." });
  return user.member;
}

const consumerRouter = router({
  getMyCards: protectedProcedure.query(async ({ ctx }) => {
    const member = requireMember(ctx.user);
    return db.getLoyaltyAccountsByMember(member.id);
  }),

  getTransactions: protectedProcedure
    .input(z.object({ loyaltyAccountId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const member = requireMember(ctx.user);
      const accounts = await db.getLoyaltyAccountsByMember(member.id);
      const account = accounts.find((a) => a.id === input.loyaltyAccountId);
      if (!account) throw new TRPCError({ code: "FORBIDDEN" });
      return db.getPointsLedgerByAccount(input.loyaltyAccountId);
    }),

  getAvailableOffers: protectedProcedure
    .input(z.object({ merchantId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const member = requireMember(ctx.user);
      const accounts = await db.getLoyaltyAccountsByMember(member.id);
      const account = accounts.find((a) => a.merchantId === input.merchantId);
      const offers = await db.getActiveOffersByMerchant(input.merchantId);
      return { offers, account: account ?? null };
    }),

  getRedemptions: protectedProcedure.query(async ({ ctx }) => {
    const member = requireMember(ctx.user);
    return db.getRedemptionsByMember(member.id);
  }),
});

// ─── Admin ────────────────────────────────────────────────────────────────────
const adminRouter = router({
  getStats: adminProcedure.query(async () => {
    return db.getPlatformStats();
  }),

  getAllMerchants: adminProcedure
    .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return db.getLiveMerchants(input.limit, input.offset);
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  merchants: merchantsRouter,
  consumer: consumerRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
