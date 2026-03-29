-- Migration 018: Add trial email tracking column
-- Tracks which trial lifecycle emails have been sent to each user.
-- Values: comma-separated list of "welcome", "warning", "expired"

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_email_sent TEXT DEFAULT '';
