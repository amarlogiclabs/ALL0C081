
import { query } from './src/db/index.js';

async function fixSchema() {
    try {
        console.log('Starting schema fix...');

        // 1. Drop Foreign Keys if they exist (hard to know exact names, so better to try modifying and catch error? 
        // Or inspect information_schema. Let's try to modify directly first, usually MySQL complains).
        // Actually, getting FK names is safer.

        const tables = ['room_participants', 'match_scores'];

        for (const table of tables) {
            console.log(`Checking ${table}...`);

            // Get FKs for user_id
            const fks = await query(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = ? AND COLUMN_NAME = 'user_id' AND REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = 'codeverse'
      `, [table]);

            for (const fk of fks) {
                console.log(`Dropping FK ${fk.CONSTRAINT_NAME} from ${table}`);
                await query(`ALTER TABLE ${table} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
            }

            // Modify column
            console.log(`Modifying user_id in ${table} to VARCHAR(255)`);
            await query(`ALTER TABLE ${table} MODIFY user_id VARCHAR(255) NOT NULL`);

            // We can optionally re-add FK if we are sure user_profiles.id is VARCHAR.
            // Let's check user_profiles.id type first.
        }

        console.log('Schema fix completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Schema fix failed:', error);
        process.exit(1);
    }
}

fixSchema();
