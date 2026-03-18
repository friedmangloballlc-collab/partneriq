-- ============================================================
-- 004: Add video_pitch_url column to talents table
-- Stores the URL of the talent's recorded 60-second video pitch
-- ============================================================

ALTER TABLE talents ADD COLUMN IF NOT EXISTS video_pitch_url TEXT;
