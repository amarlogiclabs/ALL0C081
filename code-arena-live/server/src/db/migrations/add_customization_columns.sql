-- Database Migration: Add Customization Columns to Match Rooms
-- Purpose: Add language, level, and timing columns to support customizable match settings
-- Run this if you get "Unknown column" errors on room creation

USE codeverse;

-- Check if columns exist and add them if they don't
ALTER TABLE match_rooms 
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'javascript' AFTER max_participants,
ADD COLUMN IF NOT EXISTS level VARCHAR(20) DEFAULT 'medium' AFTER language,
ADD COLUMN IF NOT EXISTS timing INT DEFAULT 30 AFTER level;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_language ON match_rooms(language);
CREATE INDEX IF NOT EXISTS idx_level ON match_rooms(level);

-- Verify the columns were added
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'match_rooms' AND TABLE_SCHEMA = 'codeverse'
ORDER BY ORDINAL_POSITION;
