/**
 * Database Migration: Fix match_scores table schema
 * Adds missing columns that were in the schema but not in the actual table
 */

export const fixMatchScoresSchema = async (connection) => {
    try {
        console.log('Checking match_scores table schema...');

        // Check if execution_time_ms column exists
        const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'match_scores' 
      AND COLUMN_NAME = 'execution_time_ms'
    `);

        if (columns.length === 0) {
            console.log('Adding missing execution_time_ms column...');
            await connection.query(`
        ALTER TABLE match_scores 
        ADD COLUMN execution_time_ms INT DEFAULT 0 AFTER test_cases_total
      `);
            console.log('✓ Added execution_time_ms column');
        } else {
            console.log('✓ execution_time_ms column already exists');
        }

        // Check if memory_used_mb column exists
        const [memoryCol] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'match_scores' 
      AND COLUMN_NAME = 'memory_used_mb'
    `);

        if (memoryCol.length === 0) {
            console.log('Adding missing memory_used_mb column...');
            await connection.query(`
        ALTER TABLE match_scores 
        ADD COLUMN memory_used_mb INT DEFAULT 0 AFTER execution_time_ms
      `);
            console.log('✓ Added memory_used_mb column');
        } else {
            console.log('✓ memory_used_mb column already exists');
        }

        // Check if submission_time_seconds column exists
        const [submissionCol] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'match_scores' 
      AND COLUMN_NAME = 'submission_time_seconds'
    `);

        if (submissionCol.length === 0) {
            console.log('Adding missing submission_time_seconds column...');
            await connection.query(`
        ALTER TABLE match_scores 
        ADD COLUMN submission_time_seconds INT DEFAULT 0 AFTER memory_used_mb
      `);
            console.log('✓ Added submission_time_seconds column');
        } else {
            console.log('✓ submission_time_seconds column already exists');
        }

        // Check if rank column exists
        const [rankCol] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'match_scores' 
      AND COLUMN_NAME = 'rank'
    `);

        if (rankCol.length === 0) {
            console.log('Adding missing rank column...');
            await connection.query(`
        ALTER TABLE match_scores 
        ADD COLUMN rank INT AFTER score
      `);
            console.log('✓ Added rank column');
        } else {
            console.log('✓ rank column already exists');
        }

        console.log('✓ Match scores schema fix complete');
        return true;
    } catch (error) {
        console.error('Error fixing match_scores schema:', error);
        throw error;
    }
};

export default fixMatchScoresSchema;
