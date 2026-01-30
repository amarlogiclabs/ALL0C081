-- Drop foreign key constraint on room_participants.user_id
-- This FK to user_profiles is blocking room creation

SET @fk_name = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'room_participants' 
                AND REFERENCED_TABLE_NAME = 'user_profiles' LIMIT 1);

SET @sql = CONCAT('ALTER TABLE room_participants DROP FOREIGN KEY ', @fk_name);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Also drop on match_rooms if exists
SET @fk_name2 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'match_rooms' 
                AND REFERENCED_TABLE_NAME = 'user_profiles' LIMIT 1);

SET @sql2 = IF(@fk_name2 IS NOT NULL, CONCAT('ALTER TABLE match_rooms DROP FOREIGN KEY ', @fk_name2), 'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
