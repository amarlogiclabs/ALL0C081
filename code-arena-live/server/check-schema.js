/**
 * Check database schema
 * Run: node check-schema.js
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

async function checkSchema() {
    let connection;

    try {
        console.log('\n🔌 Connecting to MySQL...');
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ Connected\n');

        // Check match_scores table
        console.log('📋 match_scores table structure:');
        const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'match_scores'
      ORDER BY ORDINAL_POSITION
    `);

        if (columns.length === 0) {
            console.log('❌ Table does not exist');
        } else {
            console.table(columns);
        }

        // Check coding_questions table
        console.log('\n📋 coding_questions table structure:');
        const [qCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'coding_questions'
      ORDER BY ORDINAL_POSITION
    `);

        if (qCols.length === 0) {
            console.log('❌ Table does not exist');
        } else {
            console.table(qCols);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkSchema();
