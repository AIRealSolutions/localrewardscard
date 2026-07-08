import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { supabaseAdmin } from "./supabaseAdmin";

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

export async function authenticateRequest(req: Request): Promise<User> {
  const token = getBearerToken(req);
  if (!token) throw new Error("Missing session token");

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid or expired session");

  const openId = data.user.id;
  const email = data.user.email ?? null;
  const name =
    (data.user.user_metadata?.name as string | undefined) ??
    email?.split("@")[0] ??
    null;

  let user = await db.getUserByOpenId(openId);
  if (!user) {
    await db.upsertUser({
      openId,
      email,
      name,
      loginMethod: "email",
      lastSignedIn: new Date(),
    });
    user = await db.getUserByOpenId(openId);
  } else {
    await db.upsertUser({ openId, lastSignedIn: new Date() });
  }

  if (!user) throw new Error("Failed to sync user record");
  return user;
}
