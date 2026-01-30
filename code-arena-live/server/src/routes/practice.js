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
    const { problemId, passed, type = 'coding' } = req.body;
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
            // Check if already exist
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
        res.json({ success: true });
    } catch (error) {
        console.error("Practice Submit Error:", error);
        res.status(500).json({ error: "Failed to submit" });
    }
});

export default router;
