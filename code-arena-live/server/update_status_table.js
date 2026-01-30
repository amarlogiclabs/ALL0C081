
import { query } from './src/db/index.js';

async function updateStatusTable() {
    try {
        console.log('Updating user_problem_status table...');

        // 1. Check if column exists
        const columns = await query(`SHOW COLUMNS FROM user_problem_status LIKE 'problem_type'`);
        if (columns.length > 0) {
            console.log('Column problem_type already exists.');
        } else {
            console.log('Adding problem_type column...');
            await query(`ALTER TABLE user_problem_status ADD COLUMN problem_type VARCHAR(20) DEFAULT 'coding'`);
        }

        // 2. Update Primary Key
        // First check current keys
        // We assume PK is (user_id, problem_id). We need to change it.
        // Or if it's a unique index.
        // Safest is to Drop Primary Key and Add it back.
        // But if it doesn't exist?
        // Let's try to just ADD the new PK invalidating the old one? No.

        try {
            await query(`ALTER TABLE user_problem_status DROP PRIMARY KEY`);
        } catch (e) {
            console.log('Info: Could not drop primary key (maybe did not exist or different name).', e.message);
        }

        try {
            await query(`ALTER TABLE user_problem_status ADD PRIMARY KEY (user_id, problem_id, problem_type)`);
            console.log('Updated Primary Key.');
        } catch (e) {
            console.log('Info: Could not add primary key (maybe already exists).', e.message);
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateStatusTable();
