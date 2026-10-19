-- 02: Remove public (anon) insert access to submissions and newsletter_subscriptions.
--
-- 01-init-schema.sql created INSERT policies WITH CHECK (true), so anyone holding the
-- public anon key (shipped to every browser as NEXT_PUBLIC_SUPABASE_ANON_KEY) could
-- write rows directly, skipping the API's validation, honeypot and rate limits.
--
-- The API routes write with the service-role key (lib/supabase.ts), which bypasses
-- RLS, so they keep working after this runs.
--
-- BEFORE RUNNING: confirm SUPABASE_SERVICE_ROLE_KEY is set for Production in the
-- Vercel project, and that the deployed code is the version that uses it.
--
-- Run in the Supabase dashboard -> SQL Editor. Safe to run more than once.

-- RLS stays on: with no anon/authenticated policies, those roles can't read or write.
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to insert submissions" ON submissions;
DROP POLICY IF EXISTS "Allow public to insert newsletter subscriptions" ON newsletter_subscriptions;

-- Belt and braces: remove table privileges from the client roles too.
REVOKE INSERT, UPDATE, DELETE ON submissions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON newsletter_subscriptions FROM anon, authenticated;

-- Check: this should list no policies for either table (or only ones you added on purpose).
SELECT schemaname, tablename, policyname, roles, cmd
FROM pg_policies
WHERE tablename IN ('submissions', 'newsletter_subscriptions');
