/**
 * Quick fix for database schema issues
 * Run: node quick-fix-db.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root254',
    database: process.env.DB_NAME || 'codeverse',
    port: parseInt(process.env.DB_PORT || '3306'),
    multipleStatements: true
};

async function quickFix() {
    let connection;

    try {
        console.log('\n╔═══════════════════════════════════════════╗');
        console.log('║   DATABASE QUICK FIX - CodeVerse         ║');
        console.log('╚═══════════════════════════════════════════╝\n');

        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Connected\n');

        // Read and execute the SQL fix
        console.log('📝 Applying match_scores schema fix...');
        const sqlFix = fs.readFileSync('./src/db/migrations/fix-match-scores.sql', 'utf8');
        await connection.query(sqlFix);
        console.log('✅ match_scores table updated\n');

        // Create coding_questions table
        console.log('📝 Creating coding_questions table...');
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
        starter_code JSON COMMENT 'Starter code templates for different languages',
        solution_code JSON COMMENT 'Reference solutions for different languages',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(difficulty),
        INDEX(topic),
        INDEX(created_at)
      )
    `);
        console.log('✅ coding_questions table created\n');

        // Check if we need to seed
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM coding_questions');
        if (rows[0].count === 0) {
            console.log('📝 Seeding coding questions...');

            const questions = [
                {
                    title: 'Two Sum',
                    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.',
                    difficulty: 'Easy',
                    topic: 'Arrays',
                    acceptance: '49.2%',
                    tags: JSON.stringify(['Array', 'Hash Table']),
                    constraints: '2 <= nums.length <= 10^4',
                    sample_test_cases: JSON.stringify([
                        { input: '[2,7,11,15]\n9', output: '[0,1]' }
                    ]),
                    hidden_test_cases: JSON.stringify([
                        { input: '[2,7,11,15]\n9', output: '[0,1]' },
                        { input: '[3,2,4]\n6', output: '[1,2]' }
                    ])
                },
                {
                    title: 'Reverse String',
                    description: 'Write a function that reverses a string.',
                    difficulty: 'Easy',
                    topic: 'String',
                    acceptance: '76.8%',
                    tags: JSON.stringify(['String', 'Two Pointers']),
                    constraints: '1 <= s.length <= 10^5',
                    sample_test_cases: JSON.stringify([
                        { input: 'hello', output: 'olleh' }
                    ]),
                    hidden_test_cases: JSON.stringify([
                        { input: 'hello', output: 'olleh' },
                        { input: 'Hannah', output: 'hannaH' }
                    ])
                }
            ];

            for (const q of questions) {
                await connection.query(
                    `INSERT INTO coding_questions 
           (title, description, difficulty, topic, acceptance, tags, constraints, sample_test_cases, hidden_test_cases) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [q.title, q.description, q.difficulty, q.topic, q.acceptance, q.tags, q.constraints, q.sample_test_cases, q.hidden_test_cases]
                );
            }
            console.log('✅ Seeded 2 coding questions\n');
        } else {
            console.log(`✅ coding_questions already has ${rows[0].count} questions\n`);
        }

        console.log('╔═══════════════════════════════════════════╗');
        console.log('║   ✅ DATABASE FIX COMPLETE!              ║');
        console.log('╚═══════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed\n');
        }
    }
}

quickFix();
