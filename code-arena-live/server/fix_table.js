import { query } from './src/db/index.js';

async function fixTable() {
    try {
        console.log('Dropping and recreating room_participants table...');

        // First, drop data from room_participants (optional, to avoid data issues)
        await query('TRUNCATE TABLE room_participants');
        console.log('Truncated room_participants');

        // Drop the table
        await query('DROP TABLE room_participants');
        console.log('Dropped room_participants');

        // Recreate with correct schema
        await query(`
      CREATE TABLE IF NOT EXISTS room_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id VARCHAR(36) NOT NULL,
        user_id INT NOT NULL,
        team_number INT,
        status ENUM('joined', 'ready', 'coding', 'submitted', 'completed') DEFAULT 'joined',
        code_submitted LONGTEXT,
        execution_result JSON,
        score INT DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP NULL,
        UNIQUE KEY unique_participant (room_id, user_id),
        INDEX(room_id),
        INDEX(user_id),
        INDEX(status)
      )
    `);
        console.log('Recreated room_participants with correct schema');

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixTable();
