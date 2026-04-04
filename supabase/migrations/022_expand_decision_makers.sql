-- Migration 022: Expand decision_makers with GMO fields
-- Adds columns for personal email, location, city, headline, company phone

ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_first_name TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_last_name TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_headline TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_location TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_business_email TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_personal_email TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_city TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_linkedin_id TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_company_name TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS company_meta_phones TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_picture TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_skills TEXT[];
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS person_connections TEXT;
ALTER TABLE decision_makers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
