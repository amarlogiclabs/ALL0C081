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
 * @param {number} eloA - Player A's current ELO
 * @param {number} eloB - Player B's current ELO
 * @param {number} scoreA - Player A's score (1 for win, 0.5 for draw, 0 for loss)
 * @returns {Object} { newEloA, newEloB, changeA, changeB }
 */
export const calculateNewRatings = (eloA, eloB, scoreA) => {
    const expectedA = getExpectedScore(eloA, eloB);
    const expectedB = getExpectedScore(eloB, eloA);
    const scoreB = 1 - scoreA;

    const changeA = Math.round(K_FACTOR * (scoreA - expectedA));
    const changeB = Math.round(K_FACTOR * (scoreB - expectedB));

    return {
        newEloA: eloA + changeA,
        newEloB: eloB + changeB,
        changeA,
        changeB
    };
};

/**
 * Process match result and update ELOs transactionally
 * @param {string} matchId - The room/match ID
 * @param {string} player1Id - Player 1's User ID
 * @param {string} player2Id - Player 2's User ID
 * @param {string} winnerId - The winner's User ID (null for draw)
 */
export const processMatchResult = async (matchId, player1Id, player2Id, winnerId = null) => {
    // Start transaction
    await query('START TRANSACTION');

    try {
        const users = await query(
            `SELECT id, elo FROM user_profiles WHERE id IN (?, ?) FOR UPDATE`,
            [player1Id, player2Id]
        );

        if (users.length !== 2) {
            throw new Error('Could not find both users for ELO update');
        }

        const p1 = users.find(u => u.id === player1Id);
        const p2 = users.find(u => u.id === player2Id);

        const elo1 = p1.elo || 1000;
        const elo2 = p2.elo || 1000;

        let score1 = 0.5; // Default to draw
        if (winnerId === player1Id) score1 = 1;
        else if (winnerId === player2Id) score1 = 0;

        const { newEloA: newElo1, newEloB: newElo2, changeA: change1, changeB: change2 } = calculateNewRatings(elo1, elo2, score1);

        // Record History logic
        const recordResult = async (userId, opponentId, oldElo, newElo, change, result) => {
            const id = randomUUID();
            await query(
                `INSERT INTO match_results (id, match_id, user_id, opponent_id, old_elo, new_elo, elo_change, result)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, matchId, userId, opponentId, oldElo, newElo, change, result]
            );

            const tier = getTier(newElo);
            const winIncrement = result === 'win' ? 1 : 0;
            await query(
                `UPDATE user_profiles SET elo = ?, tier = ?, wins = wins + ?, total_matches = total_matches + 1 WHERE id = ?`,
                [newElo, tier, winIncrement, userId]
            );
        };

        const result1 = winnerId === null ? 'draw' : (winnerId === player1Id ? 'win' : 'loss');
        const result2 = winnerId === null ? 'draw' : (winnerId === player2Id ? 'win' : 'loss');

        await recordResult(player1Id, player2Id, elo1, newElo1, change1, result1);
        await recordResult(player2Id, player1Id, elo2, newElo2, change2, result2);

        await query('COMMIT');

        return {
            [player1Id]: { old: elo1, new: newElo1, change: change1, result: result1 },
            [player2Id]: { old: elo2, new: newElo2, change: change2, result: result2 }
        };

    } catch (error) {
        await query('ROLLBACK');
        console.error('ELO Update Failed:', error);
        throw error;
    }
};

/**
 * Process team match result (2v2)
 */
export const processTeamMatchResult = async (matchId, team1Ids, team2Ids, winningTeam = null) => {
    await query('START TRANSACTION');

    try {
        const allIds = [...team1Ids, ...team2Ids];
        const users = await query(
            `SELECT id, elo FROM user_profiles WHERE id IN (${allIds.map(() => '?').join(',')}) FOR UPDATE`,
            allIds
        );

        const getUser = (id) => users.find(u => u.id === id) || { elo: 1000 };
        const getAvgElo = (ids) => ids.reduce((sum, id) => sum + (getUser(id).elo || 1000), 0) / ids.length;

        const eloTeam1 = getAvgElo(team1Ids);
        const eloTeam2 = getAvgElo(team2Ids);

        let scoreTeam1 = 0.5;
        if (winningTeam === 1) scoreTeam1 = 1;
        else if (winningTeam === 2) scoreTeam1 = 0;

        const results = {};

        // Update each player based on their team's average vs opponent team's average
        const processPlayer = async (userId, teamElo, opponentElo, playerIdx, isTeam1) => {
            const user = getUser(userId);
            const oldElo = user.elo || 1000;

            // Expected score is based on team averages
            const expectedScore = getExpectedScore(teamElo, opponentElo);
            const actualScore = isTeam1 ? scoreTeam1 : (1 - scoreTeam1);
            const eloChange = Math.round(K_FACTOR * (actualScore - expectedScore));
            const newElo = oldElo + eloChange;
            const tier = getTier(newElo);
            const resultLabel = winningTeam === null ? 'draw' : ((isTeam1 && winningTeam === 1) || (!isTeam1 && winningTeam === 2) ? 'win' : 'loss');

            const matchResultId = randomUUID();
            await query(
                `INSERT INTO match_results (id, match_id, user_id, opponent_id, old_elo, new_elo, elo_change, result)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [matchResultId, matchId, userId, null, oldElo, newElo, eloChange, resultLabel]
            );

            await query(
                `UPDATE user_profiles SET elo = ?, tier = ?, wins = wins + ?, total_matches = total_matches + 1 WHERE id = ?`,
                [newElo, tier, resultLabel === 'win' ? 1 : 0, userId]
            );

            results[userId] = { old: oldElo, new: newElo, change: eloChange, result: resultLabel };
        };

        for (const id of team1Ids) await processPlayer(id, eloTeam1, eloTeam2, 0, true);
        for (const id of team2Ids) await processPlayer(id, eloTeam2, eloTeam1, 0, false);

        await query('COMMIT');
        return results;

    } catch (error) {
        await query('ROLLBACK');
        console.error('Team ELO Update Failed:', error);
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

export default { calculateNewRatings, processMatchResult, processTeamMatchResult, getTier };

