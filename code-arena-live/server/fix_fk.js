import { query } from './src/db/index.js';

async function fixForeignKeys() {
    try {
        console.log('Getting foreign key constraints...');

        // Get FK constraints on room_participants
        const fks = await query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'codeverse' 
      AND TABLE_NAME = 'room_participants' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

        console.log('Found FKs:', fks);

        for (const fk of fks) {
            console.log('Dropping FK:', fk.CONSTRAINT_NAME);
            try {
                await query(`ALTER TABLE room_participants DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
                console.log('Dropped successfully');
            } catch (e) {
                console.log('Already dropped or error:', e.message);
            }
        }

        // Get FK constraints on match_rooms  
        const fks2 = await query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'codeverse' 
      AND TABLE_NAME = 'match_rooms' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

        console.log('Found match_rooms FKs:', fks2);

        for (const fk of fks2) {
            console.log('Dropping FK:', fk.CONSTRAINT_NAME);
            try {
                await query(`ALTER TABLE match_rooms DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
                console.log('Dropped successfully');
            } catch (e) {
                console.log('Already dropped or error:', e.message);
            }
        }

        console.log('Done fixing foreign keys!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixForeignKeys();
