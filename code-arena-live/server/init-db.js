/**
 * Initialize database tables for CodeVerse
 * Run: node init-db.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root254',
  database: process.env.DB_NAME || 'codeverse',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function initializeDatabase() {
  let connection;

  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL\n');

    // Create match_rooms table
    console.log('📝 Creating match_rooms table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS match_rooms (
        id VARCHAR(255) PRIMARY KEY,
        room_code VARCHAR(4) NOT NULL UNIQUE,
        host_id VARCHAR(255) NOT NULL,
        match_type VARCHAR(10) NOT NULL,
        max_participants INT NOT NULL,
        problem_id VARCHAR(255) DEFAULT NULL,
        language VARCHAR(50) DEFAULT 'javascript',
        level VARCHAR(20) DEFAULT 'medium',
        timing INT DEFAULT 30,
        status VARCHAR(20) NOT NULL DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        started_at TIMESTAMP DEFAULT NULL,
        ended_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (host_id) REFERENCES user_profiles(id)
      )
    `);
    console.log('✅ match_rooms table created\n');

    // Create room_participants table
    console.log('📝 Creating room_participants table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id VARCHAR(255) PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        team_number INT DEFAULT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'joined',
        code LONGTEXT DEFAULT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP DEFAULT NULL,
        FOREIGN KEY (room_id) REFERENCES match_rooms(id),
        FOREIGN KEY (user_id) REFERENCES user_profiles(id)
      )
    `);
    console.log('✅ room_participants table created\n');

    // Create match_scores table
    console.log('📝 Creating match_scores table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS match_scores (
        id VARCHAR(255) PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        score INT DEFAULT NULL,
        test_cases_passed INT DEFAULT NULL,
        test_cases_total INT DEFAULT NULL,
        FOREIGN KEY (room_id) REFERENCES match_rooms(id),
        FOREIGN KEY (user_id) REFERENCES user_profiles(id)
      )
    `);
    console.log('✅ match_scores table created\n');

    console.log('✅ Database initialization complete!\n');
    console.log('Tables created:');
    console.log('  - match_rooms');
    console.log('  - room_participants');
    console.log('  - match_scores\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
