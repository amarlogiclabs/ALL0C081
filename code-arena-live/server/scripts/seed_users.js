
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const NAMES = [
    "CodeWarrior", "ByteNinja", "AlgoExpert", "BugSlayer", "DevMaster",
    "Pythonista", "Javapocalypse", "Rustacean", "GoGopher", "Lisper",
    "CyberPunk", "NeonCoder", "GlitchHunter", "StackOverflow", "NullPtr",
    "SegFault", "InfiniteLoop", "RecursionKing", "BigO", "LogN",
    "BitWise", "HexDump", "BinaryBoss", "CompileHero", "SyntaxError",
    "Undefined", "NaN", "ObjectOriented", "Functional", "Lambda",
    "Closure", "Promise", "AsyncAwait", "Callback", "EventLoop",
    "DomMaster", "CssWizard", "HtmlHero", "ReactRocket", "VueViper",
    "AngularAce", "NodeNinja", "ExpressExpert", "MongoMaster", "SqlSlayer",
    "GitGuru", "DockerDave", "K8sKing", "AwsAce", "AzureAgent",
    "MatrixCoder", "DataDrift", "KernelKey", "ShellShock", "ScriptSavant"
];

const TIERS = [
    { name: 'Universal', min: 2400 },
    { name: 'Celestia', min: 2000 },
    { name: 'Galactic', min: 1800 },
    { name: 'Cosmic', min: 1600 },
    { name: 'Luminary', min: 1400 },
    { name: 'Stellar', min: 1200 },
    { name: 'Nova', min: 1000 },
    { name: 'Nebula', min: 0 }
];

const getTier = (elo) => {
    for (const tier of TIERS) {
        if (elo >= tier.min) return tier.name;
    }
    return 'Nebula';
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

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

        const seedCount = 200;
        console.log(`🌱 Seeding ${seedCount} mock users into user_profiles...`);

        for (let i = 0; i < seedCount; i++) {
            const id = 'user_mock_' + randomUUID().substring(0, 8);
            const username = `${NAMES[i % NAMES.length]}${getRandomInt(10, 999)}`;
            const email = `${username.toLowerCase()}@example.com`;
            // Fixed password hash for 'password123'
            const password_hash = '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1';
            const created_at = new Date();
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

            // Insert random profile stats
            const matches_played = getRandomInt(5, 200);
            const wins = getRandomInt(Math.floor(matches_played * 0.3), matches_played);
            const elo = getRandomInt(800, 2600);
            const tier = getTier(elo);

            await connection.query(
                `INSERT INTO user_profiles (id, username, email, password_hash, avatar, elo, tier, total_matches, wins, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 elo = VALUES(elo), 
                 tier = VALUES(tier), 
                 total_matches = VALUES(total_matches), 
                 wins = VALUES(wins)`,
                [id, username, email, password_hash, avatar, elo, tier, matches_played, wins, created_at]
            );

            if (i % 20 === 0) console.log(`✅ Progress: ${i}/${seedCount}`);
        }

        console.log(`✨ Successfully seeded ${seedCount} mock users with Cosmic tiers!`);

    } catch (error) {
        console.error('❌ Error seeding users:', error);
    } finally {
        if (connection) await connection.end();
    }
};

main();
