import type { Request } from "express";
import type { Member, Merchant } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { supabaseAdmin } from "./supabaseAdmin";

export type AuthenticatedUser = {
  authId: string;
  email: string | null;
  name: string | null;
  role: "consumer" | "business_owner" | "admin" | "unregistered";
  member: Member | null;
  merchant: Merchant | null;
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

export async function authenticateRequest(req: Request): Promise<AuthenticatedUser> {
  const token = getBearerToken(req);
  if (!token) throw new Error("Missing session token");

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid or expired session");

  const authId = data.user.id;
  const email = data.user.email ?? null;
  const name = (data.user.user_metadata?.full_name as string | undefined) ?? email?.split("@")[0] ?? null;

  const [merchant, member] = await Promise.all([
    db.getMerchantByOwnerId(authId),
    db.getMemberByUserId(authId),
  ]);

  if (email && ENV.ownerEmail && email === ENV.ownerEmail) {
    await db.grantPlatformAdmin(authId);
  }
  const isAdmin = await db.isPlatformAdmin(authId);

  const role: AuthenticatedUser["role"] = isAdmin
    ? "admin"
    : merchant
      ? "business_owner"
      : member
        ? "consumer"
        : "unregistered";

  return { authId, email, name, role, member: member ?? null, merchant: merchant ?? null };
}
