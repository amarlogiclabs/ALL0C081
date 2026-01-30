/**
 * Simple database fix
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function simpleFix() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root254',
        database: process.env.DB_NAME || 'codeverse',
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    try {
        console.log('Connected to database\n');

        // Fix match_scores table - add missing columns
        console.log('Adding missing columns to match_scores...');

        try {
            await connection.query('ALTER TABLE match_scores ADD COLUMN execution_time_ms INT DEFAULT 0');
            console.log('✅ Added execution_time_ms');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   execution_time_ms already exists');
            } else {
                throw e;
            }
        }

        try {
            await connection.query('ALTER TABLE match_scores ADD COLUMN memory_used_mb INT DEFAULT 0');
            console.log('✅ Added memory_used_mb');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   memory_used_mb already exists');
            } else {
                throw e;
            }
        }

        try {
            await connection.query('ALTER TABLE match_scores ADD COLUMN submission_time_seconds INT DEFAULT 0');
            console.log('✅ Added submission_time_seconds');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   submission_time_seconds already exists');
            } else {
                throw e;
            }
        }

        try {
            await connection.query('ALTER TABLE match_scores ADD COLUMN `rank` INT');
            console.log('✅ Added rank');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('   rank already exists');
            } else {
                throw e;
            }
        }

        // Create coding_questions table
        console.log('\nCreating coding_questions table...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS coding_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
        topic VARCHAR(100),
        acceptance VARCHAR(20),
        tags JSON,
        constraints TEXT,
        sample_test_cases JSON,
        hidden_test_cases JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        console.log('✅ coding_questions table ready');

        // Seed if empty
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM coding_questions');
        if (rows[0].count === 0) {
            console.log('\nSeeding questions...');
            await connection.query(`
        INSERT INTO coding_questions (title, description, difficulty, topic, acceptance, sample_test_cases, hidden_test_cases) VALUES
        ('Two Sum', 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.', 'Easy', 'Arrays', '49.2%', '[]', '[]'),
        ('Reverse String', 'Write a function that reverses a string.', 'Easy', 'String', '76.8%', '[]', '[]')
      `);
            console.log('✅ Seeded 2 questions');
        } else {
            console.log(`\nTables ready (${rows[0].count} questions exist)`);
        }

        console.log('\n✅ ALL FIXES APPLIED!\n');

    } catch (error) {
        console.error('ERROR:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

simpleFix().catch(console.error);
