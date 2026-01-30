/**
 * Database Migration: Create coding_questions table
 * This table stores coding problems for practice and battles
 */

export const createQuestionsTable = async (connection) => {
    try {
        console.log('Creating coding_questions table...');

        await connection.query(`
      CREATE TABLE IF NOT EXISTS coding_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL DEFAULT 'Medium',
        topic VARCHAR(100),
        acceptance VARCHAR(20),
        tags JSON,
        constraints TEXT,
        sample_test_cases JSON,
        hidden_test_cases JSON,
        starter_code JSON COMMENT 'Starter code templates for different languages',
        solution_code JSON COMMENT 'Reference solutions for different languages',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(difficulty),
        INDEX(topic),
        INDEX(created_at)
      )
    `);

        console.log('✓ coding_questions table created successfully');
        return true;
    } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('✓ coding_questions table already exists');
            return true;
        }
        console.error('Error creating coding_questions table:', error);
        throw error;
    }
};

export default createQuestionsTable;
