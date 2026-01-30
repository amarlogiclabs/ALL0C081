
import { query } from './src/db/index.js';

const problems = [
    {
        id: 1,
        title: "Two Sum",
        difficulty: "Easy",
        topic: "Arrays",
        acceptance: "49.2%",
        description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.",
        examples: JSON.stringify([
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so we return [0, 1]" },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6, so we return [1, 2]" }
        ]),
        constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9",
        test_cases: JSON.stringify([
            { input: "[2,7,11,15], 9", output: "[0,1]" },
            { input: "[3,2,4], 6", output: "[1,2]" }
        ])
    },
    {
        id: 2,
        title: "Reverse String",
        difficulty: "Easy",
        topic: "Strings",
        acceptance: "85.1%",
        description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        examples: JSON.stringify([
            { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ]),
        constraints: "1 <= s.length <= 10^5",
        test_cases: JSON.stringify([
            { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }
        ])
    },
    {
        id: 3,
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stack",
        acceptance: "40.3%",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        examples: JSON.stringify([
            { input: 's = "()"', output: "true" }
        ]),
        constraints: "1 <= s.length <= 10^4",
        test_cases: JSON.stringify([
            { input: '"()"', output: "true" }
        ])
    }
    // Add more as needed, just seeding basics for now
];

async function setupProblems() {
    try {
        console.log('Creating problems table...');

        await query(`
      CREATE TABLE IF NOT EXISTS problems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(50),
        topic VARCHAR(100),
        acceptance VARCHAR(20),
        tags JSON,
        examples JSON,
        constraints TEXT,
        test_cases JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        console.log('Seeding problems...');

        for (const p of problems) {
            // Check if exists
            const existing = await query('SELECT id FROM problems WHERE id = ?', [p.id]);
            if (existing.length === 0) {
                await query(
                    `INSERT INTO problems (id, title, description, difficulty, topic, acceptance, examples, constraints, test_cases)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [p.id, p.title, p.description, p.difficulty, p.topic, p.acceptance, p.examples, p.constraints, p.test_cases]
                );
                console.log(`Inserted problem ${p.id}: ${p.title}`);
            } else {
                console.log(`Problem ${p.id} already exists`);
            }
        }

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to setup problems:', error);
        process.exit(1);
    }
}

setupProblems();
