-- 03: Store the applicant's role and allow submissions without an attachment.
--
-- The demo form collects a role and makes the attachment optional, but 01 created
-- submissions without a role column and with audio_url NOT NULL. Until this runs,
-- /api/submit-demo still works: it retries without `role` and stores '' for a
-- missing attachment, and the role always goes out in the notification email.
--
-- Run in the Supabase dashboard -> SQL Editor. Safe to run more than once.

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE submissions ALTER COLUMN audio_url DROP NOT NULL;

-- Rows saved before this migration with no attachment used ''; normalise to NULL.
UPDATE submissions SET audio_url = NULL WHERE audio_url = '';

-- Make PostgREST pick up the new column immediately.
NOTIFY pgrst, 'reload schema';
