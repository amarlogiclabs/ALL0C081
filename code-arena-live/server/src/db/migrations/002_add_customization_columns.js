/**
 * Database Migration: Add Customization Columns to Match Rooms
 * 
 * IMPORTANT: This migration is for EXISTING databases only.
 * For NEW databases, columns are automatically included in 001_create_match_tables.js
 * 
 * This migration adds language, level, and timing columns to the match_rooms table
 * if they don't already exist. Useful for upgrading existing deployments.
 */

export const addCustomizationColumns = async (connection) => {
  try {
    console.log('Checking for customization columns in match_rooms table...');
    
    // Check if columns already exist
    const columns = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'match_rooms' AND TABLE_SCHEMA = DATABASE()`
    );
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    let columnsAdded = false;
    
    // Add language column if it doesn't exist
    if (!columnNames.includes('language')) {
      await connection.query(`
        ALTER TABLE match_rooms 
        ADD COLUMN language VARCHAR(50) DEFAULT 'javascript' AFTER max_participants
      `);
      console.log('✓ Added language column');
      columnsAdded = true;
    }
    
    // Add level column if it doesn't exist
    if (!columnNames.includes('level')) {
      await connection.query(`
        ALTER TABLE match_rooms 
        ADD COLUMN level VARCHAR(20) DEFAULT 'medium' AFTER language
      `);
      console.log('✓ Added level column');
      columnsAdded = true;
    }
    
    // Add timing column if it doesn't exist
    if (!columnNames.includes('timing')) {
      await connection.query(`
        ALTER TABLE match_rooms 
        ADD COLUMN timing INT DEFAULT 30 AFTER level
      `);
      console.log('✓ Added timing column');
      columnsAdded = true;
    }
    
    // Add indexes only if they don't exist (use IF NOT EXISTS equivalent)
    if (columnsAdded) {
      try {
        await connection.query(`
          ALTER TABLE match_rooms 
          ADD INDEX idx_language (language)
        `);
        console.log('✓ Added language index');
      } catch (e) {
        if (e.code !== 'ER_DUP_INDEX' && e.code !== 'ER_DUP_KEY_NAME') {
          throw e;
        }
      }
      
      try {
        await connection.query(`
          ALTER TABLE match_rooms 
          ADD INDEX idx_level (level)
        `);
        console.log('✓ Added level index');
      } catch (e) {
        if (e.code !== 'ER_DUP_INDEX' && e.code !== 'ER_DUP_KEY_NAME') {
          throw e;
        }
      }
    }
    
    if (!columnsAdded) {
      console.log('✓ Customization columns already exist - no migration needed');
    } else {
      console.log('✓ Customization columns added successfully');
    }
    return true;
  } catch (error) {
    // If table doesn't exist yet, that's OK - the CREATE TABLE migration will handle it
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('✓ Skipping migration - match_rooms table will be created by initial migration');
      return true;
    }
    console.error('Error adding customization columns:', error);
    throw error;
  }
};

export default addCustomizationColumns;
