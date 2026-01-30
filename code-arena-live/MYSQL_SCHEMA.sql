-- Code Arena MySQL Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS codeverse;
USE codeverse;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  elo INT DEFAULT 1200,
  tier VARCHAR(50) DEFAULT 'Bronze',
  total_matches INT DEFAULT 0,
  wins INT DEFAULT 0,
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_elo (elo),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Problems Table
CREATE TABLE IF NOT EXISTS problems (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  tags JSON DEFAULT '[]',
  examples JSON DEFAULT '[]',
  constraints JSON DEFAULT '[]',
  test_cases JSON DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_difficulty (difficulty),
  FULLTEXT INDEX ft_title_description (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Battles Table
CREATE TABLE IF NOT EXISTS battles (
  id VARCHAR(255) PRIMARY KEY,
  player1_id VARCHAR(255) NOT NULL,
  player2_id VARCHAR(255) NOT NULL,
  problem_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  winner_id VARCHAR(255),
  player1_verdict VARCHAR(50),
  player2_verdict VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP NULL,
  FOREIGN KEY (player1_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (player2_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES user_profiles(id) ON DELETE SET NULL,
  INDEX idx_player1 (player1_id),
  INDEX idx_player2 (player2_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  battle_id VARCHAR(255) NOT NULL,
  problem_id VARCHAR(255) NOT NULL,
  code LONGTEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  verdict VARCHAR(50) CHECK (verdict IN ('AC', 'WA', 'TLE', 'RE', 'CE')),
  execution_time FLOAT,
  memory_used FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_battle (battle_id),
  INDEX idx_verdict (verdict),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Battle Events Table (for logging)
CREATE TABLE IF NOT EXISTS battle_events (
  id VARCHAR(255) PRIMARY KEY,
  battle_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  event_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  INDEX idx_battle (battle_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Problems Data
INSERT INTO problems (id, title, description, difficulty, tags) VALUES
(
  'two-sum',
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
  'Easy',
  '["Array", "Hash Table"]'
),
(
  'longest-substring',
  'Longest Substring Without Repeating Characters',
  'Given a string s, find the length of the longest substring without repeating characters.',
  'Medium',
  '["String", "Sliding Window"]'
),
(
  'median-sorted-arrays',
  'Median of Two Sorted Arrays',
  'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).',
  'Hard',
  '["Array", "Binary Search"]'
);

-- Create Views for easier querying
CREATE OR REPLACE VIEW v_battle_summary AS
SELECT 
  b.id,
  b.player1_id,
  b.player2_id,
  p1.username as player1_username,
  p2.username as player2_username,
  p1.elo as player1_elo,
  p2.elo as player2_elo,
  b.problem_id,
  pr.title as problem_title,
  b.status,
  b.winner_id,
  b.created_at,
  b.ended_at
FROM battles b
JOIN user_profiles p1 ON b.player1_id = p1.id
JOIN user_profiles p2 ON b.player2_id = p2.id
JOIN problems pr ON b.problem_id = pr.id;

CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
  id,
  username,
  email,
  elo,
  tier,
  total_matches,
  wins,
  CASE 
    WHEN total_matches > 0 THEN ROUND((wins / total_matches) * 100, 2)
    ELSE 0
  END as win_rate,
  created_at
FROM user_profiles
ORDER BY elo DESC;

-- Create stored procedures for common operations

DELIMITER $$

CREATE PROCEDURE sp_update_battle_status(
  IN p_battle_id VARCHAR(255),
  IN p_status VARCHAR(50),
  IN p_winner_id VARCHAR(255)
)
BEGIN
  UPDATE battles 
  SET status = p_status, 
      winner_id = p_winner_id,
      ended_at = NOW()
  WHERE id = p_battle_id;
END$$

CREATE PROCEDURE sp_update_user_stats(
  IN p_user_id VARCHAR(255),
  IN p_elo_change INT
)
BEGIN
  UPDATE user_profiles 
  SET elo = elo + p_elo_change,
      total_matches = total_matches + 1,
      wins = CASE WHEN p_elo_change > 0 THEN wins + 1 ELSE wins END
  WHERE id = p_user_id;
END$$

CREATE PROCEDURE sp_get_leaderboard(
  IN p_limit INT
)
BEGIN
  SELECT 
    id,
    username,
    elo,
    tier,
    total_matches,
    wins,
    ROUND((wins / total_matches) * 100, 2) as win_rate
  FROM user_profiles
  WHERE total_matches > 0
  ORDER BY elo DESC
  LIMIT p_limit;
END$$

DELIMITER ;
