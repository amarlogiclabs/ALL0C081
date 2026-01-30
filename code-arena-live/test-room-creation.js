/**
 * Test script for room creation and joining
 * Tests: 1v1 and 2v2 room creation
 */

const API_BASE = 'http://localhost:5000/api';

async function getAuthToken() {
  try {
    console.log('🔐 Creating test user...\n');
    
    const email = 'testuser_' + Date.now() + '@example.com';
    const username = 'testuser_' + Date.now();
    const password = 'TestPassword123!';

    // Signup
    const signupResponse = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        username
      }),
    });

    const signupData = await signupResponse.json();
    
    if (!signupResponse.ok) {
      console.error('Signup failed:', signupData.error);
      return null;
    }

    console.log('✅ Signup successful!');
    console.log(`Token: ${signupData.token}\n`);
    return signupData.token;
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    return null;
  }
}

async function testRoomCreation(token) {
  try {
    console.log('\n=== Testing Room Creation API ===\n');

    // Test 1v1 room creation
    console.log('📝 Test 1: Creating 1v1 room...');
    const create1v1 = await fetch(`${API_BASE}/match/room/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        matchType: '1v1',
        language: 'javascript',
        level: 'medium',
        timing: 30,
      }),
    });

    const room1v1Data = await create1v1.json();
    console.log(`Status: ${create1v1.status}`);
    console.log('Response:', JSON.stringify(room1v1Data, null, 2));

    if (!create1v1.ok) {
      console.error('❌ 1v1 room creation failed');
      return;
    }

    const room1v1Id = room1v1Data.roomId;
    const room1v1Code = room1v1Data.roomCode;
    console.log(`✅ 1v1 Room created! ID: ${room1v1Id}, Code: ${room1v1Code}\n`);

    // Test 2v2 room creation
    console.log('📝 Test 2: Creating 2v2 room...');
    const create2v2 = await fetch(`${API_BASE}/match/room/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        matchType: '2v2',
        language: 'python',
        level: 'hard',
        timing: 45,
      }),
    });

    const room2v2Data = await create2v2.json();
    console.log(`Status: ${create2v2.status}`);
    console.log('Response:', JSON.stringify(room2v2Data, null, 2));

    if (!create2v2.ok) {
      console.error('❌ 2v2 room creation failed');
      return;
    }

    const room2v2Id = room2v2Data.roomId;
    const room2v2Code = room2v2Data.roomCode;
    console.log(`✅ 2v2 Room created! ID: ${room2v2Id}, Code: ${room2v2Code}\n`);

    // Test get room state
    console.log('📝 Test 3: Getting 1v1 room state...');
    const getRoom = await fetch(`${API_BASE}/match/room/${room1v1Id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const roomState = await getRoom.json();
    console.log(`Status: ${getRoom.status}`);
    console.log('Room State:', JSON.stringify(roomState, null, 2));
    console.log(`✅ Room state retrieved\n`);

    // Test joining a room
    console.log('📝 Test 4: Joining 1v1 room with different user...');
    
    // Create second user
    const signup2 = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        username: 'testuser2_' + Date.now()
      }),
    });

    const signupData2 = await signup2.json();
    if (!signup2.ok) {
      console.error('Signup failed:', signupData2.error);
      return;
    }

    const testToken2 = signupData2.token;
    
    const joinRoom = await fetch(`${API_BASE}/match/room/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken2}`,
      },
      body: JSON.stringify({
        roomCode: room1v1Code,
      }),
    });

    const joinData = await joinRoom.json();
    console.log(`Status: ${joinRoom.status}`);
    console.log('Response:', JSON.stringify(joinData, null, 2));

    if (!joinRoom.ok) {
      console.error('❌ Room joining failed');
      return;
    }

    console.log(`✅ Room joined successfully\n`);

    // Get updated room state after join
    console.log('📝 Test 5: Getting updated room state...');
    const getUpdatedRoom = await fetch(`${API_BASE}/match/room/${room1v1Id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const updatedRoomState = await getUpdatedRoom.json();
    console.log('Updated Room State:', JSON.stringify(updatedRoomState, null, 2));
    console.log(`✅ Updated room state shows ${updatedRoomState.room?.participantCount} participants\n`);

    console.log('✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Main execution
async function main() {
  const token = await getAuthToken();
  if (!token) {
    console.error('Failed to get auth token');
    process.exit(1);
  }
  await testRoomCreation(token);
}

main();
