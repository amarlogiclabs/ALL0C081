
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
    "GitGuru", "DockerDave", "K8sKing", "AwsAce", "AzureAgent"
];

const TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

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

        console.log('Seeding 50 mock users into user_profiles...');

        for (let i = 0; i < 50; i++) {
            const id = randomUUID();
            const username = `${NAMES[i % NAMES.length]}_${getRandomInt(10, 99)}`;
            const email = `${username.toLowerCase()}@example.com`;
            // Fixed password hash for 'password123'
            const password_hash = '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1';
            const created_at = new Date();
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

            // Insert random profile stats
            const matches_played = getRandomInt(0, 100);
            const wins = getRandomInt(0, matches_played);
            const elo = getRandomInt(800, 2500);
            const tier = TIERS[Math.floor(elo / 500)] || "Diamond";

            await connection.query(
                `INSERT INTO user_profiles (id, username, email, password_hash, avatar, elo, tier, total_matches, wins, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, username, email, password_hash, avatar, elo, tier, matches_played, wins, created_at]
            );
        }

        console.log('Successfully seeded 50 mock users.');

    } catch (error) {
        console.error('Error seeding users:', error);
    } finally {
        if (connection) await connection.end();
    }
};

main();
