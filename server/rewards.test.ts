import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getBusinessByOwnerId: vi.fn(),
  getBusinessById: vi.fn(),
  getApprovedBusinesses: vi.fn(),
  createBusiness: vi.fn(),
  updateBusiness: vi.fn(),
  getBusinessStats: vi.fn(),
  getBusinessCustomers: vi.fn(),
  getOrCreateLoyaltyCard: vi.fn(),
  updateLoyaltyCard: vi.fn(),
  createTransaction: vi.fn(),
  getMilestonesByBusiness: vi.fn(),
  getAccrualRule: vi.fn(),
  getLoyaltyCardsByConsumer: vi.fn(),
  getTransactionsByCard: vi.fn(),
  getAvailableOffers: vi.fn(),
  getLoyaltyCardByConsumerAndBusiness: vi.fn(),
  createRedemption: vi.fn(),
  updateRewardsOffer: vi.fn(),
  getRedemptionsByConsumer: vi.fn(),
  getOffersByBusiness: vi.fn(),
  createRewardsOffer: vi.fn(),
  deleteRewardsOffer: vi.fn(),
  createMilestone: vi.fn(),
  deleteMilestone: vi.fn(),
  upsertAccrualRule: vi.fn(),
  getCampaignsByBusiness: vi.fn(),
  createCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
  getPlatformStats: vi.fn(),
  getAllBusinesses: vi.fn(),
  getPendingBusinesses: vi.fn(),
  getAllUsers: vi.fn(),
  updateUserOnboarding: vi.fn(),
}));

import * as db from "./db";

// ─── Context Factories ────────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext["user"]> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      phone: null,
      loginMethod: "email",
      role: "consumer",
      onboardingComplete: true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeBusinessCtx() {
  return makeCtx({ role: "business_owner" });
}

function makeAdminCtx() {
  return makeCtx({ role: "admin", id: 99 });
}

const mockBusiness = {
  id: 10,
  ownerId: 1,
  name: "Test Café",
  description: "A great café",
  category: "Food & Beverage",
  address: "123 Main St",
  city: "Springfield",
  state: "IL",
  zip: "62701",
  phone: "555-0100",
  email: "cafe@example.com",
  website: "https://testcafe.com",
  status: "approved" as const,
  pointsPerDollar: "1.00",
  magicfishbowlId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  pointsExpireDays: null,
};

const mockCard = {
  id: 5,
  consumerId: 1,
  businessId: 10,
  pointsBalance: 200,
  lifetimePoints: 200,
  visitCount: 3,
  tier: "bronze" as const,
  cardNumber: "LR-000001",
  isActive: true,
  enrolledAt: new Date(),
  updatedAt: new Date(),
};

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, email: "test@example.com" });
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

// ─── Business Tests ───────────────────────────────────────────────────────────
describe("business.getMyBusiness", () => {
  it("returns the business for the authenticated owner", async () => {
    vi.mocked(db.getBusinessByOwnerId).mockResolvedValue(mockBusiness);
    const ctx = makeBusinessCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.getMyBusiness();
    expect(result).toMatchObject({ name: "Test Café" });
    expect(db.getBusinessByOwnerId).toHaveBeenCalledWith(1);
  });

  it("returns undefined when no business exists", async () => {
    vi.mocked(db.getBusinessByOwnerId).mockResolvedValue(undefined);
    const ctx = makeBusinessCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.getMyBusiness();
    expect(result).toBeUndefined();
  });
});

describe("business.getStats", () => {
  it("returns stats for the business owner", async () => {
    vi.mocked(db.getBusinessByOwnerId).mockResolvedValue(mockBusiness);
    vi.mocked(db.getBusinessStats).mockResolvedValue({ customerCount: 5, pointsIssued: 1000, redemptionCount: 3, activeOffers: 2 });
    const ctx = makeBusinessCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.getStats();
    expect(result.customerCount).toBe(5);
    expect(result.pointsIssued).toBe(1000);
  });

  it("throws NOT_FOUND when no business exists", async () => {
    vi.mocked(db.getBusinessByOwnerId).mockResolvedValue(undefined);
    const ctx = makeBusinessCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.business.getStats()).rejects.toThrow("NOT_FOUND");
  });
});

describe("business.issuePoints", () => {
  it("issues points to a consumer and returns new balance", async () => {
    vi.mocked(db.getBusinessByOwnerId).mockResolvedValue(mockBusiness);
    vi.mocked(db.getOrCreateLoyaltyCard).mockResolvedValue(mockCard);
    vi.mocked(db.getAccrualRule).mockResolvedValue(undefined);
    vi.mocked(db.updateLoyaltyCard).mockResolvedValue(undefined);
    vi.mocked(db.createTransaction).mockResolvedValue(1);
    vi.mocked(db.getMilestonesByBusiness).mockResolvedValue([]);
    const ctx = makeBusinessCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.business.issuePoints({ consumerId: 2, points: 50 });
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(250);
  });

  it("throws FORBIDDEN when business is not approved", async () => {
    vi.mocked(db.getBusinessByOwnerId).mockResolvedValue({ ...mockBusiness, status: "pending" });
    const ctx = makeBusinessCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.business.issuePoints({ consumerId: 2, points: 50 })).rejects.toThrow("Business not approved");
  });
});

// ─── Consumer Tests ───────────────────────────────────────────────────────────
describe("consumer.getMyCards", () => {
  it("returns enriched cards for the consumer", async () => {
    vi.mocked(db.getLoyaltyCardsByConsumer).mockResolvedValue([mockCard]);
    vi.mocked(db.getBusinessById).mockResolvedValue(mockBusiness);
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.consumer.getMyCards();
    expect(result).toHaveLength(1);
    expect(result[0].card.id).toBe(5);
    expect(result[0].business?.name).toBe("Test Café");
  });
});

// ─── Admin Tests ──────────────────────────────────────────────────────────────
describe("admin.getStats", () => {
  it("returns platform stats for admin users", async () => {
    vi.mocked(db.getPlatformStats).mockResolvedValue({
      totalUsers: 100, totalBusinesses: 20, totalCards: 300, totalPointsIssued: 50000, totalRedemptions: 150,
    });
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getStats();
    expect(result.totalUsers).toBe(100);
    expect(result.totalBusinesses).toBe(20);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const ctx = makeCtx({ role: "consumer" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getStats()).rejects.toThrow("FORBIDDEN");
  });
});

describe("admin.approveBusiness", () => {
  it("approves a business and returns success", async () => {
    vi.mocked(db.updateBusiness).mockResolvedValue(undefined);
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.approveBusiness({ id: 10 });
    expect(result.success).toBe(true);
    expect(db.updateBusiness).toHaveBeenCalledWith(10, { status: "approved" });
  });
});

describe("admin.getAllBusinesses", () => {
  it("returns a paginated list of all businesses", async () => {
    vi.mocked(db.getAllBusinesses).mockResolvedValue([mockBusiness]);
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.admin.getAllBusinesses({ limit: 10, offset: 0 });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Test Café");
  });
});
