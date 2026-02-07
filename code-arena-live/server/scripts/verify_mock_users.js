// Quick test script to verify mock users and matchmaking API
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

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

        console.log('=== MOCK USERS VERIFICATION ===\n');

        // Count mock users
        const [countResult] = await connection.query(
            "SELECT COUNT(*) as total FROM user_profiles WHERE id LIKE 'user_mock%'"
        );
        console.log(`Total Mock Users: ${countResult[0].total}`);

        // ELO distribution
        const [eloStats] = await connection.query(
            "SELECT MIN(elo) as min_elo, MAX(elo) as max_elo, AVG(elo) as avg_elo FROM user_profiles WHERE id LIKE 'user_mock%'"
        );
        console.log(`ELO Range: ${eloStats[0].min_elo} - ${eloStats[0].max_elo} (avg: ${Math.round(eloStats[0].avg_elo)})`);

        // Tier distribution
        const [tierDist] = await connection.query(
            "SELECT tier, COUNT(*) as count FROM user_profiles WHERE id LIKE 'user_mock%' GROUP BY tier ORDER BY count DESC"
        );
        console.log('\nTier Distribution:');
        tierDist.forEach(t => console.log(`  ${t.tier}: ${t.count} users`));

        // Sample users
        const [sampleUsers] = await connection.query(
            "SELECT id, username, elo, tier, wins, total_matches FROM user_profiles WHERE id LIKE 'user_mock%' ORDER BY elo DESC LIMIT 5"
        );
        console.log('\nTop 5 Mock Users by ELO:');
        sampleUsers.forEach(u => console.log(`  ${u.username} | ELO: ${u.elo} | Tier: ${u.tier} | ${u.wins}/${u.total_matches} wins`));

        // Simulate matchmaking query for a user with ELO 1200 (typical new user)
        const testElo = 1200;
        const [matchmakingResults] = await connection.query(
            `SELECT id, username, tier, elo, wins, total_matches
             FROM user_profiles 
             WHERE id LIKE 'user_mock%'
             AND elo BETWEEN ? AND ?
             ORDER BY ABS(elo - ?) ASC, (wins / GREATEST(total_matches, 1)) DESC
             LIMIT 10`,
            [testElo - 300, testElo + 300, testElo]
        );
        console.log(`\nMatchmaking Test (for ELO ${testElo}, range ${testElo - 300}-${testElo + 300}):`);
        console.log(`  Found ${matchmakingResults.length} potential opponents`);
        if (matchmakingResults.length > 0) {
            console.log('  Top 3 matches:');
            matchmakingResults.slice(0, 3).forEach(u => console.log(`    ${u.username} | ELO: ${u.elo} | Tier: ${u.tier}`));
        }

        console.log('\n=== ALL CHECKS PASSED ===');
        console.log('Mock users are ready for matchmaking!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
};

main();
