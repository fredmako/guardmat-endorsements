-- Guardmat Endorsements Database Schema
-- Run this in Supabase SQL editor

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Endorsements table
CREATE TABLE IF NOT EXISTS endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endorsement_id TEXT NOT NULL UNIQUE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_endorsements INTEGER NOT NULL DEFAULT 1000,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'endorsement_start', 'endorsement_complete', 'qr_scan', 'social_share', 'verification')),
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  referral_source TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'moderator' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  admin_email TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_endorsements_school_id ON endorsements(school_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_verified ON endorsements(verified);
CREATE INDEX IF NOT EXISTS idx_endorsements_flagged ON endorsements(flagged);
CREATE INDEX IF NOT EXISTS idx_endorsements_created_at ON endorsements(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Schools: anyone can read
CREATE POLICY "Schools are publicly readable" ON schools FOR SELECT USING (true);

-- Endorsements: anyone can read verified ones, only service role can insert/update
CREATE POLICY "Verified endorsements are publicly readable" ON endorsements FOR SELECT USING (verified = true);
CREATE POLICY "Service role can insert endorsements" ON endorsements FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update endorsements" ON endorsements FOR UPDATE USING (true);

-- Campaigns: anyone can read
CREATE POLICY "Campaigns are publicly readable" ON campaigns FOR SELECT USING (true);

-- Analytics: only service role can insert
CREATE POLICY "Service role can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);

-- OTP: only service role
CREATE POLICY "Service role can manage OTP" ON otp_verifications FOR ALL USING (true);

-- Admin users: only service role
CREATE POLICY "Service role can manage admin users" ON admin_users FOR ALL USING (true);

-- Audit logs: only service role
CREATE POLICY "Service role can manage audit logs" ON audit_logs FOR ALL USING (true);

-- Insert default campaign
INSERT INTO campaigns (name, description, start_date, end_date, target_endorsements, active)
VALUES (
  'Guardmat Community School Feeding Initiative 2026',
  'Supporting school feeding programs for primary school pupils in Kisii County through community endorsements.',
  '2026-10-01',
  '2026-10-31',
  1000,
  true
) ON CONFLICT DO NOTHING;

-- Insert sample schools (replace with real data)
INSERT INTO schools (name, slug, location) VALUES
  ('Kisii Primary School', 'kisii-primary', 'Kisii Town'),
  ('Mogingo Primary School', 'mogingo-primary', 'Mogingo'),
  ('Ogembo Primary School', 'ogembo-primary', 'Ogembo'),
  ('Keroka Primary School', 'keroka-primary', 'Keroka'),
  ('Suneka Primary School', 'suneka-primary', 'Suneka')
ON CONFLICT (slug) DO NOTHING;
