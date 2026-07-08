import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
  console.error(
    "[Auth] ERROR: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured!"
  );
}

export const supabaseAdmin = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
