
import { query } from './src/db/index.js';

async function setupQuestionTables() {
    try {
        console.log('Creating new question tables...');

        // 1. Create Aptitude Questions Table
        await query(`
            CREATE TABLE IF NOT EXISTS aptitude_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255),
                description TEXT NOT NULL,
                options JSON NOT NULL,
                correct_answer VARCHAR(255) NOT NULL,
                difficulty VARCHAR(50) DEFAULT 'Medium',
                topic VARCHAR(100),
                tags JSON,
                explanation TEXT,
                allowed_contexts JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created aptitude_questions table.');

        // 2. Create Coding Questions Table
        await query(`
            CREATE TABLE IF NOT EXISTS coding_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                difficulty VARCHAR(50) DEFAULT 'Medium',
                topic VARCHAR(100),
                tags JSON,
                constraints TEXT,
                input_format TEXT,
                output_format TEXT,
                sample_test_cases JSON,
                hidden_test_cases JSON,
                starter_code JSON,
                reference_solution TEXT,
                allowed_contexts JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Created coding_questions table.');

        // 3. Migrate existing problems to coding_questions
        console.log('Migrating existing problems...');
        const existingProblems = await query('SELECT * FROM problems');

        for (const p of existingProblems) {
            // Check if already exists in new table (by title)
            const exists = await query('SELECT id FROM coding_questions WHERE title = ?', [p.title]);
            if (exists.length > 0) {
                console.log(`Skipping ${p.title} (already exists)`);
                continue;
            }

            // Transform data if necessary. 
            // Old 'examples' field usually contained sample cases. 
            // Old 'test_cases' field contained hidden cases? Or just test cases.
            // We map old columns to new ones.

            // Default allowed_contexts
            const allowedContexts = JSON.stringify(["PRACTICE", "BATTLE"]);

            // Construct starter code if not present (simple default)
            const defaultStarterCode = JSON.stringify([
                { language: "javascript", code: "// Write your solution here\n" },
                { language: "python", code: "# Write your solution here\n" },
                { language: "java", code: "// Write your solution here\n" },
                { language: "cpp", code: "// Write your solution here\n" }
            ]);

            await query(`
                INSERT INTO coding_questions (
                    title, description, difficulty, topic, 
                    constraints, sample_test_cases, hidden_test_cases, 
                    starter_code, allowed_contexts
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                p.title,
                p.description,
                p.difficulty,
                p.topic,
                p.constraints,
                p.examples, // Mapping old examples to sample_test_cases
                p.test_cases, // Mapping old test_cases to hidden_test_cases
                defaultStarterCode,
                allowedContexts
            ]);
            console.log(`Migrated: ${p.title}`);
        }

        // 4. Seed some Aptitude Questions (Example)
        const aptitudeCount = await query('SELECT count(*) as count FROM aptitude_questions');
        if (aptitudeCount[0].count === 0) {
            console.log('Seeding aptitude questions...');
            const sampleAptitude = [
                {
                    title: "Time and Work 1",
                    description: "A can do a work in 15 days and B in 20 days. If they work on it together for 4 days, then the fraction of the work that is left is:",
                    options: JSON.stringify(["1/4", "1/10", "7/15", "8/15"]),
                    correct_answer: "8/15",
                    difficulty: "Easy",
                    topic: "Time and Work",
                    allowed_contexts: JSON.stringify(["PRACTICE", "BATTLE"])
                },
                {
                    title: "Probability 1",
                    description: "Tickets numbered 1 to 20 are mixed up and then a ticket is drawn at random. What is the probability that the ticket drawn has a number which is a multiple of 3 or 5?",
                    options: JSON.stringify(["1/2", "2/5", "8/15", "9/20"]),
                    correct_answer: "9/20",
                    difficulty: "Medium",
                    topic: "Probability",
                    allowed_contexts: JSON.stringify(["PRACTICE", "BATTLE"])
                }
            ];

            for (const q of sampleAptitude) {
                await query(`
                    INSERT INTO aptitude_questions (
                        title, description, options, correct_answer, difficulty, topic, allowed_contexts
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [q.title, q.description, q.options, q.correct_answer, q.difficulty, q.topic, q.allowed_contexts]);
            }
            console.log('Seeded aptitude questions.');
        }

        console.log('Setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
}

setupQuestionTables();
