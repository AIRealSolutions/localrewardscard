import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { AuthenticatedUser } from "./_core/auth";

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    authId: "sample-auth-id",
    email: "sample@example.com",
    name: "Sample User",
    role: "consumer",
    member: null,
    merchant: null,
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("reports success", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
  });
});
