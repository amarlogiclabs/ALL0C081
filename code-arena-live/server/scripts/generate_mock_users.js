
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const ADJECTIVES = ['Swift', 'Silent', 'Cosmic', 'Binary', 'Neon', 'Cyber', 'Quantum', 'Pixel', 'Turbo', 'Glitch', 'Savage', 'Lazy', 'Happy', 'Angry', 'Peaceful'];
const NOUNS = ['Coder', 'Hacker', 'Ninja', 'Wizard', 'Bot', 'Surfer', 'Gladiator', 'Panda', 'Eagle', 'Phantom', 'Ghost', 'Samurai', 'Pirate', 'Knight', 'Wolf'];

const GENERATE_COUNT = 50;

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getTier = (elo) => {
    if (elo < 1200) return 'Bronze';
    if (elo < 1500) return 'Silver';
    if (elo < 1800) return 'Gold';
    if (elo < 2100) return 'Platinum';
    return 'Diamond';
};

const main = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root254',
            database: process.env.DB_NAME || 'codeverse',
            port: parseInt(process.env.DB_PORT || '3306'),
        });

        console.log('Connected!');

        // Generate a common password hash
        const salt = await bcrypt.genSalt(10);
        const commonPasswordHash = await bcrypt.hash('password123', salt);

        const users = [];
        console.log(`Generating ${GENERATE_COUNT} users...`);

        for (let i = 0; i < GENERATE_COUNT; i++) {
            const adj = ADJECTIVES[getRandomInt(0, ADJECTIVES.length - 1)];
            const noun = NOUNS[getRandomInt(0, NOUNS.length - 1)];
            const username = `${adj}${noun}${getRandomInt(100, 999)}`;
            const email = `${username.toLowerCase()}@example.com`;

            // Random ELO between 800 and 2600
            // Bias towards 1200-1600 (Bell curve-ish simulation)
            let elo = Math.floor(getRandomInt(800, 2500));
            // Let's add some more realistic clustering around 1000-1500
            if (Math.random() > 0.5) {
                elo = getRandomInt(1000, 1600);
            }

            const tier = getTier(elo);

            // Simulate matches based on ELO
            // Higher ELO usually means more matches played or higher win rate
            const totalMatches = getRandomInt(5, 100);
            let winRate = 0.5;

            if (elo > 1800) winRate = 0.7 + (Math.random() * 0.2); // 70-90% win rate
            else if (elo < 1000) winRate = 0.2 + (Math.random() * 0.2); // 20-40% win rate
            else winRate = 0.4 + (Math.random() * 0.2); // 40-60% win rate

            const wins = Math.floor(totalMatches * winRate);

            // ID Generation (matching format in auth.js)
            const id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

            users.push([id, email, username, commonPasswordHash, avatar, elo, tier, totalMatches, wins]);
        }

        console.log('Inserting users...');
        const query = `
            INSERT INTO user_profiles (id, email, username, password_hash, avatar, elo, tier, total_matches, wins) 
            VALUES ?
        `;

        await connection.query(query, [users]);

        console.log(`Successfully inserted ${users.length} mock users!`);
        console.log('Sample User credentials:');
        console.log(`Username: ${users[0][2]}`);
        console.log(`Email: ${users[0][1]}`);
        console.log('Password: password123');

    } catch (error) {
        console.error('Error generating mock data:', error);
    } finally {
        if (connection) await connection.end();
    }
};

main();
