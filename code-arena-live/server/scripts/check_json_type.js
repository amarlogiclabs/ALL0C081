
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

        // Get a room with a problem
        const rooms = await connection.query(`
            SELECT m.*, p.title, p.tags
            FROM match_rooms m
            LEFT JOIN coding_questions p ON m.problem_id = p.id
            WHERE m.problem_id IS NOT NULL
            LIMIT 1
        `);

        if (rooms[0].length > 0) {
            const row = rooms[0][0];
            console.log('Title:', row.title);
            console.log('Tags Type:', typeof row.tags);
            console.log('Tags Value:', row.tags);
        } else {
            console.log('No rooms with problems found.');
            // Just check a question directly
            const qs = await connection.query('SELECT tags FROM coding_questions LIMIT 1');
            if (qs[0].length > 0) {
                console.log('Direct Q Tags Type:', typeof qs[0][0].tags);
                console.log('Direct Q Tags Value:', qs[0][0].tags);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

main();
