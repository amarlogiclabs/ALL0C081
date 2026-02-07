import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function setupDatabase() {
  let connection = null;

  try {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║   DATABASE SETUP - Creating codeverse    ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    // Connect to MySQL without specifying a database
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root254',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✓ Connected to MySQL\n');

    // Create the database
    console.log('Creating database "codeverse"...');
    await connection.query('CREATE DATABASE IF NOT EXISTS codeverse');
    console.log('✓ Database "codeverse" created\n');

    // Switch to the database
    console.log('Switching to "codeverse" database...');
    await connection.query('USE codeverse');
    console.log('✓ Using "codeverse" database\n');

    // Ensure tables exist (Aptitude History)
    console.log('Setting up tables...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_aptitude_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        category_id VARCHAR(100) NOT NULL,
        category_title VARCHAR(255) NOT NULL,
        score INT NOT NULL,
        total INT NOT NULL,
        percentage INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        match_type VARCHAR(50) DEFAULT 'ranked',
        status VARCHAR(20) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS match_results (
        id VARCHAR(255) PRIMARY KEY,
        match_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        opponent_id VARCHAR(255),
        old_elo INT NOT NULL,
        new_elo INT NOT NULL,
        elo_change INT NOT NULL,
        result VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS match_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        match_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        is_winner TINYINT(1) DEFAULT 0
      )
    `);

    console.log('✓ All match history tables ready');

    // Show tables
    console.log('Checking existing tables...');
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length === 0) {
      console.log('  No tables yet (Hibernate will create them on startup)\n');
    } else {
      console.log(`  Found ${tables.length} existing tables\n`);
    }

    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   ✓ SETUP COMPLETE!                      ║');
    console.log('║   Database is ready for application       ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('\n✗ ERROR:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Verify credentials: root / root254');
    console.error('3. Check host: 127.0.0.1:3306\n');

    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

setupDatabase();
