
import db, { query } from './src/db/index.js';
import { hashPassword, verifyPassword } from './src/services/auth.js';

async function check() {
    console.log('--- DEBUG START ---');
    console.log('DB Type:', db.constructor.name); // MockDatabase or Pool/Connection

    // list all users
    try {
        const users = await query('SELECT * FROM user_profiles');
        console.log('Total users found:', users.length);
        users.forEach(u => {
            console.log(`User: ${u.email}, Username: ${u.username}, ID: ${u.id}`);
            // Don't print hash
        });

        if (users.length > 0) {
            const demoUser = users.find(u => u.username === 'demouser');
            if (demoUser) {
                console.log('Checking demo user password...');
                const match = await verifyPassword('CodeArena123!', demoUser.password_hash);
                console.log('Password "CodeArena123!" matches?', match);
            }
        } else {
            console.log('No users found in database.');
        }

    } catch (err) {
        console.error('Error querying users:', err);
    }
    console.log('--- DEBUG END ---');
    process.exit(0);
}

check();
