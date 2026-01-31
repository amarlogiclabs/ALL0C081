
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const SAMPLE_QUESTIONS = [
    {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        tags: JSON.stringify(["Array", "Hash Table"]),
        sample_test_cases: JSON.stringify([
            { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
            { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
        ]),
        hidden_test_cases: JSON.stringify([
            { input: "[2,7,11,15]\n9", output: "[0,1]" },
            { input: "[3,2,4]\n6", output: "[1,2]" },
            { input: "[3,3]\n6", output: "[0,1]" }
        ]),
        constraints: JSON.stringify(["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"])
    },
    {
        title: "Palindrome Number",
        description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        difficulty: "Easy",
        tags: JSON.stringify(["Math"]),
        sample_test_cases: JSON.stringify([
            { input: "x = 121", output: "true" },
            { input: "x = -121", output: "false" }
        ]),
        hidden_test_cases: JSON.stringify([
            { input: "121", output: "true" },
            { input: "-121", output: "false" },
            { input: "10", output: "false" }
        ]),
        constraints: JSON.stringify(["-2^31 <= x <= 2^31 - 1"])
    }
];

const main = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root254',
            database: process.env.DB_NAME || 'codeverse',
            port: parseInt(process.env.DB_PORT || '3306'),
        });

        const [rows] = await connection.query('SELECT COUNT(*) as count FROM coding_questions');
        console.log(`Current questions count: ${rows[0].count}`);

        if (rows[0].count === 0) {
            console.log('Seeding questions...');
            for (const q of SAMPLE_QUESTIONS) {
                await connection.query(
                    `INSERT INTO coding_questions (title, description, difficulty, tags, sample_test_cases, hidden_test_cases, constraints)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [q.title, q.description, q.difficulty, q.tags, q.sample_test_cases, q.hidden_test_cases, q.constraints]
                );
            }
            console.log('Seeded sample questions.');
        } else {
            console.log('Questions already exist. Skipping seed.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
};

main();
