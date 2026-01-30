-- Fix match_scores table - add missing columns
-- Run this with: mysql -u root -p codeverse < fix-match-scores.sql

-- Add execution_time_ms if it doesn't exist
SET @col_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'match_scores' 
  AND COLUMN_NAME = 'execution_time_ms'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE match_scores ADD COLUMN execution_time_ms INT DEFAULT 0 AFTER test_cases_total',
  'SELECT "Column execution_time_ms already exists" AS Status');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add memory_used_mb if it doesn't exist  
SET @col_exists2 = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'match_scores' 
  AND COLUMN_NAME = 'memory_used_mb'
);

SET @sql2 = IF(@col_exists2 = 0,
  'ALTER TABLE match_scores ADD COLUMN memory_used_mb INT DEFAULT 0 AFTER execution_time_ms',
  'SELECT "Column memory_used_mb already exists" AS Status');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Add submission_time_seconds if it doesn't exist
SET @col_exists3 = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'match_scores' 
  AND COLUMN_NAME = 'submission_time_seconds'
);

SET @sql3 = IF(@col_exists3 = 0,
  'ALTER TABLE match_scores ADD COLUMN submission_time_seconds INT DEFAULT 0 AFTER memory_used_mb',
  'SELECT "Column submission_time_seconds already exists" AS Status');

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Add rank if it doesn't exist
SET @col_exists4 = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'match_scores' 
  AND COLUMN_NAME = 'rank'
);

SET @sql4 = IF(@col_exists4 = 0,
  'ALTER TABLE match_scores ADD COLUMN rank INT AFTER score',
  'SELECT "Column rank already exists" AS Status');

PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

SELECT 'match_scores table schema updated successfully' AS Status;
