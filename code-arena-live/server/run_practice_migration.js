import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env before importing DB
dotenv.config({ path: path.join(__dirname, '.env') });

async function runMigration() {
    try {
        // Dynamic import to ensure env is loaded first
        const { query } = await import('./src/db/index.js');

        const sqlPath = path.join(__dirname, 'src', 'db', 'migrations', 'practice_status.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await query(statement);
            }
        }

        console.log('✅ Practice status migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
