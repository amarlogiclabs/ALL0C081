
import { query } from './src/db/index.js';

async function add() {
    try {
        const roomId = '6e5d4678-4e90-4e7f-926c-fc19fe35d76c';
        await query("INSERT INTO room_participants (room_id, user_id, status, team_number) VALUES (?, ?, ?, ?)", [roomId, 'user_test_p2', 'joined', 1]);
        console.log('Added participant');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
add();
