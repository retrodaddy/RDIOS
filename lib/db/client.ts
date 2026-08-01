import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The one Postgres client every real (non-mock) provider imports —
 * Enterprise Foundation §4.1's own "provider.ts is the interface;
 * mock-provider.ts is one implementation of it" seam, now given its
 * second implementation. Nothing above `provider.ts` in any domain
 * changes to make this exist.
 *
 * Server-only, service-role-authenticated: bypasses RLS by design,
 * because Step 1 ships every table with RLS enabled and zero permissive
 * policies (real auth.uid()-based policies are Step 2's own follow-on
 * work, per the Enterprise Foundation's three-layer isolation design).
 * Institution scoping is enforced here the same way it already is in
 * every mock-provider today: every real provider function takes
 * `institutionId` as a real parameter and filters by it in every query,
 * a discipline, not yet a structural database-level guarantee — that
 * upgrade is named explicitly, not silently promised, in the Step 1
 * Implementation Report.
 *
 * A singleton, guarded the identical way every mock-provider's own
 * `globalThis` store already is, so Next.js dev-mode module reloading
 * never creates a second client mid-session.
 */
const g = globalThis as unknown as { __rdiosDbClient?: SupabaseClient };

export function db(): SupabaseClient {
  if (!g.__rdiosDbClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check .env.local. " +
          "This client must never fall back to a placeholder connection."
      );
    }
    g.__rdiosDbClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return g.__rdiosDbClient;
}

/** Thrown by a real provider when a Postgres call itself fails (network,
 *  constraint violation, etc.) — never swallowed silently, always
 *  surfaced to the action layer that already knows how to turn a failure
 *  into an honest `{ ok: false, error }` result, exactly as every
 *  existing action already does for its own validation failures. */
export class DbError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "DbError";
  }
}
