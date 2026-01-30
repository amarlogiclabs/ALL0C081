
import { query } from './src/db/index.js';
import { verifyPassword, hashPassword } from './src/services/auth.js';

async function check() {
    console.log('--- DEBUG START ---');

    try {
        const users = await query('SELECT id, email, username, password_hash FROM user_profiles');
        console.log('Total users:', users.length);
        for (const u of users) {
            console.log(`User: '${u.email}', Username: '${u.username}'`);
            console.log(`Hash starts with: ${u.password_hash.substring(0, 10)}...`);
        }

        // Attempt to verify a test password if we knew it, but we don't.
        // Instead let's checking if we can update the password for siv@g.com to '123456' 
        // just to see if the hashing works correctly.
        // But I shouldn't change data without permission unless absolutely necessary.

        // I will checking if the hash in DB is valid bcrypt hash.
        // bcrypt hashes start with $2a$ or $2b$ and are 60 chars long.

        for (const u of users) {
            const hash = u.password_hash;
            const validFormat = hash.startsWith('$2') && hash.length === 60;
            console.log(`Hash valid format for ${u.email}: ${validFormat}`);
        }

        console.log('Testing bcrypt manually...');
        const testPass = 'test123';
        const testHash = await hashPassword(testPass);
        console.log('Generated hash for "test123":', testHash);
        const verify = await verifyPassword(testPass, testHash);
        console.log('Verification result:', verify);

        const verifyWrong = await verifyPassword('wrong', testHash);
        console.log('Verification with wrong password:', verifyWrong);

    } catch (err) {
        console.error('Error:', err);
    }
    console.log('--- DEBUG END ---');
    process.exit(0);
}

check();
