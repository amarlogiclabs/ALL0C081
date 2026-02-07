import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * GET /api/matchmaking/opponents
 * Find players with similar ELO (±200) and sort by proximity/winrate
 */
router.get('/opponents', async (req, res) => {
    try {
        const userId = req.userId;

        // First get the current user's ELO
        const userRows = await query(
            'SELECT elo, tier FROM user_profiles WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { elo, tier } = userRows[0];
        const userElo = elo || 1000;

        // Find other users with similar ELO
        // We sort by:
        // 1. ABS(elo - userElo) ASC (Closest skill first)
        // 2. Wins DESC (More experienced players as challenge)
        const opponents = await query(
            `SELECT id, username, tier, elo, avatar, wins, total_matches
       FROM user_profiles 
       WHERE id != ? 
       AND elo BETWEEN ? AND ?
       ORDER BY ABS(elo - ?) ASC, (wins / GREATEST(total_matches, 1)) DESC
       LIMIT 15`,
            [userId, userElo - 300, userElo + 300, userElo]
        );

        res.json(opponents);
    } catch (error) {
        console.error('Error finding opponents:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
