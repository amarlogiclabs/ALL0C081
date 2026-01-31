
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const main = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root254',
            database: process.env.DB_NAME || 'codeverse',
            port: parseInt(process.env.DB_PORT || '3306'),
        });

        const [rows] = await connection.query(`
            SELECT title, tags, sample_test_cases, constraints 
            FROM coding_questions 
            WHERE title = 'Two Sum'
        `);

        if (rows.length > 0) {
            const row = rows[0];
            console.log('--- Two Sum ---');
            console.log('Tags Type:', typeof row.tags);
            console.log('Tags Value:', row.tags);

            console.log('Examples Type:', typeof row.sample_test_cases);
            console.log('Examples Value:', row.sample_test_cases);

            console.log('Constraints Type:', typeof row.constraints);
            console.log('Constraints Value:', row.constraints);
        } else {
            console.log('Two Sum not found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

main();
