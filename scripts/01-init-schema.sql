-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending'
);

-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS submissions_email_idx ON submissions(email);
CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON submissions(created_at);
CREATE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscriptions(email);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public read/write for submissions)
CREATE POLICY "Allow public to insert submissions"
  ON submissions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to insert newsletter subscriptions"
  ON newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);
