import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './src/db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'src/db/migrations/elo_update.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration from:', sqlPath);

        // Split by semicolon to run multiple statements if needed, but simple exec might work depending on driver
        // mysql2 execute supports multiple statements if enabled, but query() usually sends usually one.
        // Let's split manually to be safe for DDL.
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const statement of statements) {
            console.log('Executing:', statement.substring(0, 50) + '...');
            await query(statement);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
