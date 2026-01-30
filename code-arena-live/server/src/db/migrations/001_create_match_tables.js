/**
 * Database Migration: Create Match Rooms Tables
 * This creates tables for the Friendly Match feature (1v1 and 2v2 coding competitions)
 * Auto-run on server startup if tables don't exist
 */

export const createMatchTables = async (connection) => {
  try {
    console.log('Creating match_rooms table...');
    
    // Match Rooms Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS match_rooms (
        id VARCHAR(36) PRIMARY KEY,
        room_code VARCHAR(4) NOT NULL UNIQUE,
        host_id INT NOT NULL,
        match_type ENUM('1v1', '2v2') NOT NULL,
        status ENUM('waiting', 'in_progress', 'completed', 'expired') DEFAULT 'waiting',
        problem_id INT,
        max_participants INT NOT NULL,
        language VARCHAR(50) DEFAULT 'javascript',
        level VARCHAR(20) DEFAULT 'medium',
        timing INT DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        INDEX(room_code),
        INDEX(host_id),
        INDEX(status),
        INDEX(created_at),
        INDEX(language),
        INDEX(level)
      )
    `);

    console.log('Creating room_participants table...');
    
    // Room Participants Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id VARCHAR(36) NOT NULL,
        user_id INT NOT NULL,
        team_number INT,
        status ENUM('joined', 'ready', 'coding', 'submitted', 'completed') DEFAULT 'joined',
        code_submitted LONGTEXT,
        execution_result JSON,
        score INT DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL,
        FOREIGN KEY (room_id) REFERENCES match_rooms(id) ON DELETE CASCADE,
        UNIQUE KEY unique_participant (room_id, user_id),
        INDEX(room_id),
        INDEX(user_id),
        INDEX(status)
      )
    `);

    console.log('Creating match_scores table...');
    
    // Match Scores Table for scorekeeping
    await connection.query(`
      CREATE TABLE IF NOT EXISTS match_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id VARCHAR(36) NOT NULL,
        user_id INT NOT NULL,
        team_number INT,
        test_cases_passed INT DEFAULT 0,
        test_cases_total INT DEFAULT 0,
        execution_time_ms INT DEFAULT 0,
        memory_used_mb INT DEFAULT 0,
        submission_time_seconds INT DEFAULT 0,
        score INT DEFAULT 0,
        rank INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES match_rooms(id) ON DELETE CASCADE,
        INDEX(room_id),
        INDEX(user_id),
        UNIQUE KEY unique_score (room_id, user_id)
      )
    `);

    console.log('✓ Match tables created successfully');
    return true;
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('✓ Match tables already exist');
      return true;
    }
    console.error('Error creating match tables:', error);
    throw error;
  }
};

export default createMatchTables;
