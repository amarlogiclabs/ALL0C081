/**
 * Run database migrations for CodeVerse
 * Run: node run-migrations.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { createMatchTables } from './src/db/migrations/001_create_match_tables.js';
import fixMatchScoresSchema from './src/db/migrations/003_fix_match_scores.js';
import createQuestionsTable from './src/db/migrations/004_create_questions_table.js';
import seedCodingQuestions from './src/db/migrations/005_seed_questions.js';

dotenv.config();

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root254',
    database: process.env.DB_NAME || 'codeverse',
    port: parseInt(process.env.DB_PORT || '3306'),
};

async function runMigrations() {
    let connection;

    try {
        console.log('\n╔═══════════════════════════════════════════╗');
        console.log('  ║   DATABASE MIGRATIONS - CodeVerse         ║');
        console.log('  ╚═══════════════════════════════════════════╝\n');

        console.log('🔌 Connecting to MySQL...');
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Connected to MySQL\n');

        // Run migrations in order
        console.log('📦 Running migrations...\n');

        // Migration 1: Create match tables
        console.log('Migration 001: Create match tables');
        await createMatchTables(connection);

        // Migration 3: Fix match_scores schema
        console.log('\nMigration 003: Fix match_scores schema');
        await fixMatchScoresSchema(connection);

        // Migration 4: Create coding_questions table
        console.log('\nMigration 004: Create coding_questions table');
        await createQuestionsTable(connection);

        // Migration 5: Seed coding questions
        console.log('\nMigration 005: Seed coding questions');
        await seedCodingQuestions(connection);

        console.log('\n╔═══════════════════════════════════════════╗');
        console.log('  ║   ✅ ALL MIGRATIONS COMPLETE!            ║');
        console.log('  ╚═══════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ Migration error:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed\n');
        }
    }
}

runMigrations();
