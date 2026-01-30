import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkColumns() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root254',
        database: process.env.DB_NAME || 'codeverse',
        port: parseInt(process.env.DB_PORT || '3306'),
    });

    const [cols] = await conn.query(`SHOW COLUMNS FROM match_scores`);
    console.log('\nmatch_scores columns:');
    cols.forEach((col, i) => {
        console.log(`${i + 1}. ${col.Field} (${col.Type})`);
    });

    await conn.end();
}

checkColumns();
