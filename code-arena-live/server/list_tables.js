import { query } from './src/db/index.js';

async function listTables() {
    try {
        const tables = await query('SHOW TABLES');
        console.log('Tables in database:', JSON.stringify(tables, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error listing tables:', err.message);
        process.exit(1);
    }
}

listTables();
