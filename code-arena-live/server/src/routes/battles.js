import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createInstantMatch } from '../services/matchRoom.js';

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /api/battles
 * Create a new battle
 */
router.post('/', async (req, res) => {
    try {
        const player1_id = req.userId;
        const { player2_id, difficulty = 'Medium' } = req.body;

        console.log(`[Battles] Creating match: ${player1_id} vs ${player2_id} (Level: ${difficulty})`);

        if (!player2_id) {
            return res.status(400).json({ error: 'Opponent ID (player2_id) is required' });
        }

        // specific problem selection logic is handled inside createInstantMatch if not provided,
        // or we can pass it if we want custom logic. matchRoom.js assigns random problem if null.
        // For now let's pass the level.

        const result = await createInstantMatch(player1_id, player2_id, {
            level: difficulty
        });

        res.status(201).json({
            success: true,
            battleId: result.roomId,
            roomCode: result.roomCode,
            message: 'Battle created successfully'
        });
    } catch (error) {
        console.error('Error creating battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
