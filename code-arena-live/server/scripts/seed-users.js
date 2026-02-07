import { query } from '../src/db/index.js';
import { hashPassword, generateUserId } from '../src/services/auth.js';
import { getTier } from '../src/services/elo.js';

async function seedUsers(count = 50) {
    console.log(`🌱 Seeding ${count} users into the database...`);

    const usernames = [
        'CodeWarrior', 'ByteMaster', 'AlgoKing', 'SwiftCoder', 'RustAce',
        'PythonPro', 'JavaGuru', 'BitMover', 'StackOverlord', 'NullPointer',
        'DebugDemon', 'LogicLord', 'KernelKraken', 'DataDrifter', 'PixelPioneer',
        'WebWizard', 'CloudCommander', 'DevOpsDynasty', 'CyberSage', 'GritGeek',
        'BinaryBeast', 'CPlusStar', 'NodeNinja', 'ReactRuler', 'VueVoyager',
        'MongoMogul', 'SqlSultan', 'DockerDuke', 'KubernetesKnight', 'TerraformTitan'
    ];

    try {
        for (let i = 0; i < count; i++) {
            const username = usernames[i % usernames.length] + Math.floor(Math.random() * 1000);
            const email = `${username.toLowerCase()}@example.com`;
            const passwordHash = await hashPassword('password123');
            const userId = generateUserId();
            const elo = Math.floor(Math.random() * 1500) + 800; // ELO between 800 and 2300
            const tier = getTier(elo);
            const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

            await query(
                `INSERT INTO user_profiles (id, email, username, password_hash, avatar, elo, tier) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [userId, email, username, passwordHash, avatar, elo, tier]
            );

            if (i % 10 === 0) {
                console.log(`✅ Seeded ${i} users...`);
            }
        }
        console.log(`✨ Successfully seeded ${count} users!`);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.warn('⚠️ Some users already exist, skipping duplicates.');
        } else {
            console.error('❌ Seeding failed:', error);
        }
    }
    process.exit(0);
}

const count = process.argv[2] ? parseInt(process.argv[2]) : 50;
seedUsers(count);
