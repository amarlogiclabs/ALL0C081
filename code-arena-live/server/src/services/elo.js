import { query } from '../db/index.js';
import { randomUUID } from 'crypto';

const K_FACTOR = 32;

/**
 * Calculate expected score based on ELO ratings
 * @param {number} ratingA - Player A's rating
 * @param {number} ratingB - Player B's rating
 * @returns {number} Expected score for Player A (0 to 1)
 */
const getExpectedScore = (ratingA, ratingB) => {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
};

/**
 * Calculate new ratings for a match
 * @param {number} winnerElo - Winner's current ELO
 * @param {number} loserElo - Loser's current ELO
 * @returns {Object} { winnerNewElo, loserNewElo, winnerChange, loserChange }
 */
export const calculateNewRatings = (winnerElo, loserElo) => {
    const expectedWinner = getExpectedScore(winnerElo, loserElo);
    const expectedLoser = getExpectedScore(loserElo, winnerElo);

    // Winner gets 1 point, Loser gets 0
    const winnerChange = Math.round(K_FACTOR * (1 - expectedWinner));
    const loserChange = Math.round(K_FACTOR * (0 - expectedLoser));

    return {
        winnerNewElo: winnerElo + winnerChange,
        loserNewElo: loserElo + loserChange,
        winnerChange,
        loserChange
    };
};

/**
 * Process match result and update ELOs transactionally
 * @param {string} matchId - The room/match ID
 * @param {string} winnerId - The winner's User ID
 * @param {string} loserId - The loser's User ID
 */
export const processMatchResult = async (matchId, winnerId, loserId) => {
    // Start transaction
    await query('START TRANSACTION');

    try {
        // Lock users for update to prevent race conditions
        // Using string interpolation for IDs in WHERE IN clause safely
        const users = await query(
            `SELECT id, elo FROM user_profiles WHERE id IN (?, ?) FOR UPDATE`,
            [winnerId, loserId]
        );

        if (users.length !== 2) {
            throw new Error('Could not find both users for ELO update');
        }

        const winner = users.find(u => u.id === winnerId);
        const loser = users.find(u => u.id === loserId);

        // Handle case where user might not have ELO set yet (default 1200)
        const winnerElo = winner.elo || 1200;
        const loserElo = loser.elo || 1200;

        const { winnerNewElo, loserNewElo, winnerChange, loserChange } = calculateNewRatings(winnerElo, loserElo);

        // Update Winner
        const winnerTier = getTier(winnerNewElo);
        await query(
            `UPDATE user_profiles SET elo = ?, tier = ?, wins = wins + 1, total_matches = total_matches + 1 WHERE id = ?`,
            [winnerNewElo, winnerTier, winnerId]
        );

        // Update Loser
        const loserTier = getTier(loserNewElo);
        await query(
            `UPDATE user_profiles SET elo = ?, tier = ?, total_matches = total_matches + 1 WHERE id = ?`,
            [loserNewElo, loserTier, loserId]
        );

        // Record History logic
        const recordResult = async (userId, opponentId, oldElo, newElo, change, result) => {
            const id = randomUUID();
            await query(
                `INSERT INTO match_results (id, match_id, user_id, opponent_id, old_elo, new_elo, elo_change, result)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, matchId, userId, opponentId, oldElo, newElo, change, result]
            );
        };

        await recordResult(winnerId, loserId, winnerElo, winnerNewElo, winnerChange, 'win');
        await recordResult(loserId, winnerId, loserElo, loserNewElo, loserChange, 'loss');

        await query('COMMIT');

        return {
            [winnerId]: { old: winnerElo, new: winnerNewElo, change: winnerChange, tier: winnerTier },
            [loserId]: { old: loserElo, new: loserNewElo, change: loserChange, tier: loserTier }
        };

    } catch (error) {
        await query('ROLLBACK');
        console.error('ELO Update Failed:', error);
        throw error;
    }
};

/**
 * Get tier name from ELO
 */
export const getTier = (elo) => {
    if (elo >= 2400) return 'Universal';
    if (elo >= 2000) return 'Celestia';
    if (elo >= 1800) return 'Galactic';
    if (elo >= 1600) return 'Cosmic';
    if (elo >= 1400) return 'Luminary';
    if (elo >= 1200) return 'Stellar';
    if (elo >= 1000) return 'Nova';
    return 'Nebula';
};

export default { calculateNewRatings, processMatchResult };
