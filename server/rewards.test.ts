import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { AuthenticatedUser } from "./_core/auth";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getMerchantById: vi.fn(),
  getLiveMerchants: vi.fn(),
  getActiveOffersByMerchant: vi.fn(),
  getRedemptionsByMember: vi.fn(),
  getLoyaltyAccountsByMember: vi.fn(),
  getPointsLedgerByAccount: vi.fn(),
  getPlatformStats: vi.fn(),
}));

import * as db from "./db";

// ─── Context Factories ────────────────────────────────────────────────────────
const mockMerchant = {
  id: "00000000-0000-4000-8000-000000000001",
  ownerUserId: "owner-auth-1",
  businessName: "Test Café",
  category: "Food & Beverage",
  address: "123 Main St",
  lat: null,
  lng: null,
  logoUrl: null,
  hours: null,
  subscriptionTier: "starter" as const,
  subscriptionStatus: "trialing" as const,
  isLive: true,
  createdAt: new Date(),
};

const mockMember = {
  id: "00000000-0000-4000-8000-000000000002",
  userId: "consumer-auth-1",
  email: "consumer@example.com",
  phone: "+15550001111",
  fullName: "Test Consumer",
  qrToken: "qr-token-1",
  nfcToken: "nfc-token-1",
  phoneVerified: true,
  createdAt: new Date(),
};

const mockLoyaltyAccount = {
  id: "00000000-0000-4000-8000-000000000003",
  memberId: mockMember.id,
  merchantId: mockMerchant.id,
  pointsBalance: 200,
  lifetimePoints: 200,
  visitCount: 3,
  tier: "bronze" as const,
  enrolledAt: new Date(),
  updatedAt: new Date(),
};

function makeCtx(overrides: Partial<AuthenticatedUser> = {}): TrpcContext {
  const user: AuthenticatedUser = {
    authId: "consumer-auth-1",
    email: "consumer@example.com",
    name: "Test Consumer",
    role: "consumer",
    member: mockMember,
    merchant: null,
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function makeAdminCtx() {
  return makeCtx({ authId: "admin-auth-1", role: "admin", member: null });
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ authId: "consumer-auth-1", email: "consumer@example.com" });
  });

  it("returns null when unauthenticated", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

// ─── Merchants Tests ────────────────────────────────────────────────────────────
describe("merchants.getLive", () => {
  it("returns a paginated list of live merchants", async () => {
    vi.mocked(db.getLiveMerchants).mockResolvedValue([mockMerchant]);
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.merchants.getLive({ limit: 10, offset: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].businessName).toBe("Test Café");
  });
});

// ─── Consumer Tests ───────────────────────────────────────────────────────────
describe("consumer.getMyCards", () => {
  it("returns loyalty accounts for the member", async () => {
    vi.mocked(db.getLoyaltyAccountsByMember).mockResolvedValue([{ ...mockLoyaltyAccount, merchant: mockMerchant }]);
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.consumer.getMyCards();
    expect(result).toHaveLength(1);
    expect(result[0].merchant?.businessName).toBe("Test Café");
    expect(db.getLoyaltyAccountsByMember).toHaveBeenCalledWith(mockMember.id);
  });

  it("throws NOT_FOUND when the caller has no member profile", async () => {
    const ctx = makeCtx({ member: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.consumer.getMyCards()).rejects.toThrow("No member profile found.");
  });
});

describe("consumer.getTransactions", () => {
  it("returns the points ledger for an owned account", async () => {
    vi.mocked(db.getLoyaltyAccountsByMember).mockResolvedValue([{ ...mockLoyaltyAccount, merchant: mockMerchant }]);
    vi.mocked(db.getPointsLedgerByAccount).mockResolvedValue([
      { id: "ledger-1", loyaltyAccountId: mockLoyaltyAccount.id, redemptionId: null, type: "earn", points: 50, amountSpent: "10.00", description: null, createdAt: new Date() },
    ]);
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.consumer.getTransactions({ loyaltyAccountId: mockLoyaltyAccount.id });
    expect(result).toHaveLength(1);
    expect(result[0].points).toBe(50);
  });

  it("throws FORBIDDEN when the account doesn't belong to the caller", async () => {
    vi.mocked(db.getLoyaltyAccountsByMember).mockResolvedValue([]);
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.consumer.getTransactions({ loyaltyAccountId: "00000000-0000-4000-8000-000000000099" })).rejects.toThrow();
  });
});

// ─── Admin Tests ──────────────────────────────────────────────────────────────
describe("admin.getStats", () => {
  it("returns platform stats for admin users", async () => {
    vi.mocked(db.getPlatformStats).mockResolvedValue({
      totalMembers: 100, totalMerchants: 20, liveMerchants: 15, totalPointsIssued: 50000, totalRedemptions: 150,
    });
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getStats();
    expect(result.totalMembers).toBe(100);
    expect(result.totalMerchants).toBe(20);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getStats()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("admin.getAllMerchants", () => {
  it("returns a paginated list of all merchants", async () => {
    vi.mocked(db.getLiveMerchants).mockResolvedValue([mockMerchant]);
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getAllMerchants({ limit: 10, offset: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].businessName).toBe("Test Café");
  });
});
