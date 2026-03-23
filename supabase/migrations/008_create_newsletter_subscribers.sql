CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  source text DEFAULT 'blog',
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_insert" ON newsletter_subscribers FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "newsletter_select" ON newsletter_subscribers FOR SELECT TO authenticated USING (true);
GRANT INSERT ON newsletter_subscribers TO anon;
GRANT SELECT, INSERT ON newsletter_subscribers TO authenticated;
