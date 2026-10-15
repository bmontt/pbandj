import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Server-only Supabase client using the service-role key. API routes write through
// this client; the public anon key is not used for inserts (see
// scripts/02-lock-down-inserts.sql, which removes the anon insert policies).
//
// Created lazily so a missing env var doesn't crash module loading (and the build):
// callers get null, log it, and degrade.

let serverClient: SupabaseClient | null = null
let warned = false

export function getSupabaseServer(): SupabaseClient | null {
  if (serverClient) return serverClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    if (!warned) {
      warned = true
      const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !serviceKey && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean)
      console.error(`[supabase] ${missing.join(" and ")} not set; database writes are disabled`)
    }
    return null
  }

  serverClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return serverClient
}
