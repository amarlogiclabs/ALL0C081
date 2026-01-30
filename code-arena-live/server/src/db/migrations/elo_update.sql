-- ELO System Database Updates

-- Ensure user_profiles has elo column (idempotent check not easily possible in pure SQL without procedure, assuming it exists or handled by initial schema, otherwise this might fail if strictly enforced, but we'll add the table)
-- We rely on the main schema for user_profiles.elo

-- Match Results Table for ELO Audit
CREATE TABLE IF NOT EXISTS match_results (
  id VARCHAR(255) PRIMARY KEY,
  match_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  opponent_id VARCHAR(255),
  old_elo INT NOT NULL,
  new_elo INT NOT NULL,
  elo_change INT NOT NULL,
  result VARCHAR(50) NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES match_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (opponent_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
  INDEX idx_match (match_id),
  INDEX idx_user (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
