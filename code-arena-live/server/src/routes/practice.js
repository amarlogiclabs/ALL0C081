import express from 'express';
import { query } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get solved problems for user
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const { type = 'coding' } = req.query;
        const rows = await query(
            'SELECT problem_id FROM user_problem_status WHERE user_id = ? AND status = "solved" AND problem_type = ?',
            [req.userId, type]
        );
        res.json({
            success: true,
            solvedProblemIds: rows.map(r => r.problem_id)
        });
    } catch (error) {
        console.error("Practice Status Error:", error);
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

// Get all practice problems
router.get('/problems', async (req, res) => {
    try {
        const { type = 'coding' } = req.query;
        const table = type === 'aptitude' ? 'aptitude_questions' : 'coding_questions';

        const problems = await query(`
            SELECT id, title, difficulty, topic, tags 
            FROM ${table} 
            WHERE JSON_CONTAINS(allowed_contexts, '"PRACTICE"')
        `);

        res.json({
            success: true,
            problems
        });
    } catch (error) {
        console.error("Fetch Problems Error:", error);
        res.status(500).json({ error: "Failed to fetch problems" });
    }
});

// Submit practice problem result
router.post('/submit', authMiddleware, async (req, res) => {
    const { problemId, code, language, passed, type = 'coding' } = req.body;

    // If no code provided, it's just marking as solved (legacy support)
    if (!code) {
        if (!problemId || typeof passed === 'undefined') {
            return res.status(400).json({ error: "Missing fields" });
        }

        try {
            if (passed) {
                await query(
                    `INSERT INTO user_problem_status (user_id, problem_id, status, problem_type)
                     VALUES (?, ?, 'solved', ?)
                     ON DUPLICATE KEY UPDATE status = 'solved', updated_at = CURRENT_TIMESTAMP`,
                    [req.userId, problemId, type]
                );
            } else {
                const current = await query(
                    'SELECT status FROM user_problem_status WHERE user_id = ? AND problem_id = ? AND problem_type = ?',
                    [req.userId, problemId, type]
                );

                if (current.length === 0) {
                    await query(
                        `INSERT INTO user_problem_status (user_id, problem_id, status, problem_type)
                         VALUES (?, ?, 'attempted', ?)`,
                        [req.userId, problemId, type]
                    );
                }
            }
            return res.json({ success: true });
        } catch (error) {
            console.error("Practice Submit Error:", error);
            return res.status(500).json({ error: "Failed to submit" });
        }
    }

    // New code execution path
    try {
        if (!language) {
            return res.status(400).json({ error: "Missing language" });
        }

        // Get problem test cases
        const problems = await query('SELECT hidden_test_cases FROM coding_questions WHERE id = ?', [problemId]);
        if (problems.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const testCases = problems[0].hidden_test_cases || [];

        // Execute code against test cases
        const { runTestSuite } = await import('../services/compiler.js');
        const result = await runTestSuite(code, language, testCases);

        // Update user status based on verdict
        if (result.verdict === 'ACCEPTED') {
            await query(
                `INSERT INTO user_problem_status (user_id, problem_id, status, problem_type)
                 VALUES (?, ?, 'solved', ?)
                 ON DUPLICATE KEY UPDATE status = 'solved', updated_at = CURRENT_TIMESTAMP`,
                [req.userId, problemId, type]
            );
        } else {
            const current = await query(
                'SELECT status FROM user_problem_status WHERE user_id = ? AND problem_id = ? AND problem_type = ?',
                [req.userId, problemId, type]
            );

            if (current.length === 0) {
                await query(
                    `INSERT INTO user_problem_status (user_id, problem_id, status, problem_type)
                     VALUES (?, ?, 'attempted', ?)`,
                    [req.userId, problemId, type]
                );
            }
        }

        res.json({ success: true, result });
    } catch (error) {
        console.error("Practice Submit Error:", error);
        res.status(500).json({ error: "Failed to submit" });
    }
});

// Run practice problem code (test only, doesn't save status)
router.post('/run', authMiddleware, async (req, res) => {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Get problem test cases (only sample cases for run, not all hidden)
        const problems = await query('SELECT hidden_test_cases FROM coding_questions WHERE id = ?', [problemId]);
        if (problems.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const allTestCases = problems[0].hidden_test_cases || [];
        // For practice run, only use first 2-3 test cases as samples
        const sampleTestCases = allTestCases.slice(0, Math.min(3, allTestCases.length));

        // Execute code against sample test cases
        const { runTestSuite } = await import('../services/compiler.js');
        const result = await runTestSuite(code, language, sampleTestCases);

        res.json({ success: true, result });
    } catch (error) {
        console.error("Practice Run Error:", error);
        res.status(500).json({ error: "Failed to run code" });
    }
});

// Save aptitude test result
router.post('/aptitude/result', authMiddleware, async (req, res) => {
    const { categoryId, categoryTitle, score, total, percentage } = req.body;

    if (!categoryId || typeof score === 'undefined' || !total) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await query(
            `INSERT INTO user_aptitude_results (user_id, category_id, category_title, score, total, percentage)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.userId, categoryId, categoryTitle, score, total, percentage]
        );
        res.json({ success: true, message: "Aptitude result saved" });
    } catch (error) {
        console.error("Aptitude Save Error:", error);
        res.status(500).json({ error: "Failed to save aptitude result" });
    }
});

export default router;
