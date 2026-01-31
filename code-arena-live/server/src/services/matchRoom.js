/**
 * Match Room Service
 * Handles all business logic for room creation, joining, state management
 */

import { randomUUID } from 'crypto';
import { query } from '../db/index.js';
import { processMatchResult } from './elo.js';


// Generate a UUID for room ID
const generateRoomId = () => randomUUID();

// Generate a 4-digit room code
const generateRoomCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const result = await query('SELECT id FROM match_rooms WHERE room_code = ?', [code]);
    exists = result.length > 0;
  }

  return code;
};

// Find an available room for random matchmaking
export const findAvailableRoom = async (userId, matchType = '1v1') => {
  try {
    // Find a room that:
    // 1. Is 'waiting'
    // 2. Is of the correct match type
    // 3. Has space (count < max)
    // 4. User is NOT already in (optional, but good practice)

    // We select rooms with participants count < max
    // Sort by created_at to fill older rooms first

    const maxParticipants = matchType === '1v1' ? 2 : 4;

    // Simple query to find candidate rooms
    const rooms = await query(
      `SELECT m.id, m.room_code, m.match_type, COUNT(rp.user_id) as participant_count 
       FROM match_rooms m
       JOIN room_participants rp ON m.id = rp.room_id
       WHERE m.status = 'waiting' AND m.match_type = ?
       GROUP BY m.id
       HAVING participant_count < ?
       ORDER BY m.created_at ASC
       LIMIT 1`,
      [matchType, maxParticipants]
    );

    if (rooms.length > 0) {
      // Check if user is already in this room (edge case)
      const room = rooms[0];
      const userInRoom = await query(
        `SELECT 1 FROM room_participants WHERE room_id = ? AND user_id = ?`,
        [room.id, userId]
      );

      if (userInRoom.length === 0) {
        return room.room_code;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding available room:', error);
    throw error;
  }
};

// Create a new match room
export const createRoom = async (hostId, matchType = '1v1', problemId = null, options = {}) => {
  try {
    const roomId = generateRoomId();
    const roomCode = await generateRoomCode();
    const maxParticipants = matchType === '1v1' ? 2 : 4;

    // Room expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const createdAt = new Date();

    // Extract options
    const language = options.language || 'javascript';
    const level = options.level || 'medium';
    const timing = options.timing || 30;

    // If no problem provided (e.g. Random Battle), assign one immediately
    let finalProblemId = problemId;
    if (!finalProblemId) {
      // Try to find a problem of the requested level
      let questions = await query(
        'SELECT id FROM coding_questions WHERE difficulty = ? ORDER BY RAND() LIMIT 1',
        [level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()] // "Medium"
      );

      if (questions.length === 0) {
        // Fallback to any problem
        questions = await query('SELECT id FROM coding_questions ORDER BY RAND() LIMIT 1');
      }

      if (questions.length > 0) {
        finalProblemId = questions[0].id;
      }
    }

    await query(
      `INSERT INTO match_rooms (id, room_code, host_id, match_type, max_participants, problem_id, expires_at, language, level, timing, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting', ?)`,
      [roomId, roomCode, hostId, matchType, maxParticipants, finalProblemId, expiresAt, language, level, timing, createdAt]
    );

    // Add host as first participant (auto-increment ID)
    const joinedAt = new Date();

    await query(
      `INSERT INTO room_participants (room_id, user_id, team_number, status, joined_at)
       VALUES (?, ?, ?, 'ready', ?)`,
      [roomId, hostId, matchType === '2v2' ? 1 : null, joinedAt]
    );

    // Handle invites if provided
    if (options.invites && Array.isArray(options.invites)) {
      for (const invite of options.invites) {
        // TODO: Store invites in database for future implementation
        // For now, just log them
        console.log(`Invite sent to ${invite.type}: ${invite.value}`);
      }
    }

    return {
      roomId,
      roomCode,
      matchType,
      maxParticipants,
      language,
      level,
      timing,
      status: 'waiting'
    };
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

// Join a room using code
export const joinRoom = async (roomCode, userId) => {
  try {
    // Find room by code
    const rooms = await query(
      `SELECT * FROM match_rooms WHERE room_code = ? AND status != 'expired'`,
      [roomCode]
    );

    if (rooms.length === 0) {
      return { success: false, error: 'Invalid or expired room code' };
    }

    const room = rooms[0];

    // Check if room is expired
    if (new Date(room.expires_at) < new Date()) {
      await query(`UPDATE match_rooms SET status = 'expired' WHERE id = ?`, [room.id]);
      return { success: false, error: 'Room has expired' };
    }

    // Check if user already in room
    const existing = await query(
      `SELECT id FROM room_participants WHERE room_id = ? AND user_id = ?`,
      [room.id, userId]
    );

    if (existing.length > 0) {
      return { success: false, error: 'You are already in this room' };
    }

    // Check if room is full
    const participants = await query(
      `SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?`,
      [room.id]
    );

    if (participants[0].count >= room.max_participants) {
      return { success: false, error: 'Room is full' };
    }

    // Check if match has started
    if (room.status !== 'waiting') {
      return { success: false, error: 'Match has already started or completed' };
    }

    // Add user to room
    let teamNumber = null;
    if (room.match_type === '2v2') {
      // Assign to team with fewer members
      const teamCounts = await query(
        `SELECT team_number, COUNT(*) as count FROM room_participants 
         WHERE room_id = ? GROUP BY team_number`,
        [room.id]
      );

      teamNumber = teamCounts.length === 0 ? 1 : (teamCounts[0].count > teamCounts[1]?.count ? 2 : 1);
    }


    const joinedAt = new Date();

    await query(
      `INSERT INTO room_participants (room_id, user_id, team_number, status, joined_at)
       VALUES (?, ?, ?, 'joined', ?)`,
      [room.id, userId, teamNumber, joinedAt]
    );

    return {
      success: true,
      roomId: room.id,
      matchType: room.match_type,
      status: room.status
    };
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
};

// Get room state
export const getRoomState = async (roomId) => {
  try {
    const rooms = await query(`
      SELECT m.*, p.title, p.description, p.difficulty, p.tags, p.sample_test_cases as examples, p.constraints 
      FROM match_rooms m
      LEFT JOIN coding_questions p ON m.problem_id = p.id
      WHERE m.id = ?
    `, [roomId]);

    if (rooms.length === 0) {
      return null;
    }

    const room = rooms[0];

    // Helper: Safely parse JSON or return valid array
    const toArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'object') return [val]; // Should probably be key-value, but for array fields effectively wraps it
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // If it's a comma-separated string, maybe split it? 
        // Or just wrap the string as one item
        return typeof val === 'string' && val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
      }
    };

    room.tags = toArray(room.tags);
    room.examples = toArray(room.examples);
    room.constraints = toArray(room.constraints);

    // Get participants
    const participants = await query(
      `SELECT 
        rp.id,
        rp.user_id,
        u.username,
        u.avatar,
        u.elo,
        u.tier,
        rp.team_number,
        rp.status,
        rp.joined_at,
        rp.submitted_at,
        rp.code_submitted,    -- Added for spectating
        ms.score,
        ms.test_cases_passed,
        ms.test_cases_total,
        ms.execution_time_ms,
        mr.elo_change,
        mr.new_elo as final_match_elo
       FROM room_participants rp
       LEFT JOIN match_scores ms ON rp.room_id = ms.room_id AND rp.user_id = ms.user_id
       LEFT JOIN user_profiles u ON rp.user_id = u.id
       LEFT JOIN match_results mr ON rp.room_id = mr.match_id AND rp.user_id = mr.user_id
       WHERE rp.room_id = ?
       ORDER BY rp.joined_at`,
      [roomId]
    );

    return {
      ...room,
      participants,
      participantCount: participants.length,
      isFull: participants.length >= room.max_participants
    };
  } catch (error) {
    console.error('Error getting room state:', error);
    throw error;
  }
};

// Leave a room
export const leaveRoom = async (roomId, userId) => {
  try {
    // Get room info
    const rooms = await query(`SELECT * FROM match_rooms WHERE id = ?`, [roomId]);

    if (rooms.length === 0) {
      return { success: false, error: 'Room not found' };
    }

    const room = rooms[0];

    // Remove participant
    await query(
      `DELETE FROM room_participants WHERE room_id = ? AND user_id = ?`,
      [roomId, userId]
    );

    // If room is empty or only has host, delete room
    const remaining = await query(
      `SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?`,
      [roomId]
    );

    if (remaining[0].count === 0) {
      await query(`DELETE FROM match_rooms WHERE id = ?`, [roomId]);
    }

    return { success: true };
  } catch (error) {
    console.error('Error leaving room:', error);
    throw error;
  }
};

// Update participant status
export const updateParticipantStatus = async (roomId, userId, status) => {
  try {
    await query(
      `UPDATE room_participants SET status = ? WHERE room_id = ? AND user_id = ?`,
      [status, roomId, userId]
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating participant status:', error);
    throw error;
  }
};

// Start match (only host can do this)
export const startMatch = async (roomId, hostId, problemId) => {
  try {
    // Verify host
    const rooms = await query(`SELECT * FROM match_rooms WHERE id = ? AND host_id = ?`, [roomId, hostId]);

    if (rooms.length === 0) {
      return { success: false, error: 'Unauthorized: Only host can start the match' };
    }

    const room = rooms[0];

    // Check if enough participants
    const participants = await query(
      `SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?`,
      [roomId]
    );

    const requiredCount = room.match_type === '1v1' ? 2 : 4;
    if (participants[0].count < requiredCount) {
      return { success: false, error: `Need ${requiredCount} participants to start` };
    }

    let finalProblemId = problemId || room.problem_id;

    // If no problem selected, pick a random one based on room settings
    if (!finalProblemId) {
      const questions = await query(
        `SELECT id FROM coding_questions WHERE difficulty = ? ORDER BY RAND() LIMIT 1`,
        [room.level || 'Medium']  // Default to Medium if not set
      );

      if (questions.length > 0) {
        finalProblemId = questions[0].id;
      } else {
        // Fallback to any question if no difficulty match
        const anyQuestions = await query(`SELECT id FROM coding_questions ORDER BY RAND() LIMIT 1`);
        if (anyQuestions.length > 0) finalProblemId = anyQuestions[0].id;
      }
    }

    // Update room status
    await query(
      `UPDATE match_rooms SET status = 'in_progress', problem_id = ?, started_at = NOW() 
       WHERE id = ?`,
      [finalProblemId, roomId]
    );

    // Initialize scores
    const allParticipants = await query(
      `SELECT user_id, team_number FROM room_participants WHERE room_id = ?`,
      [roomId]
    );

    for (const p of allParticipants) {
      await query(
        `INSERT INTO match_scores (id, room_id, user_id, team_number) VALUES (?, ?, ?, ?)`,
        [randomUUID(), roomId, p.user_id, p.team_number]
      );
    }

    return { success: true };
  } catch (error) {
    console.error('Error starting match:', error);
    throw error;
  }
};

// Submit code for a participant
export const submitCode = async (roomId, userId, code, language) => {
  try {
    // Get room and problem info
    const rooms = await query(`SELECT * FROM match_rooms WHERE id = ?`, [roomId]);
    if (rooms.length === 0) throw new Error('Room not found');
    const room = rooms[0];

    // Get problem test cases (hidden + sample)
    const problems = await query(`SELECT hidden_test_cases FROM coding_questions WHERE id = ?`, [room.problem_id]);

    let testCases = [];
    if (problems.length > 0) {
      testCases = problems[0].hidden_test_cases || [];
    }

    // Execute code server-side against all test cases
    const { runTestSuite } = await import('./compiler.js');
    const executionResult = await runTestSuite(code, language, testCases);

    // Update submission
    await query(
      `UPDATE room_participants 
       SET code_submitted = ?, execution_result = ?, status = 'submitted', submitted_at = NOW()
       WHERE room_id = ? AND user_id = ?`,
      [code, JSON.stringify(executionResult), roomId, userId]
    );

    // Update scores if available
    if (executionResult.testCasesPassed !== undefined) {
      await query(
        `UPDATE match_scores 
         SET test_cases_passed = ?, test_cases_total = ?, execution_time_ms = ?
         WHERE room_id = ? AND user_id = ?`,
        [
          executionResult.testCasesPassed,
          executionResult.testCasesTotal || 0,
          executionResult.executionTime || 0,
          roomId,
          userId
        ]
      );
    }

    // Check if all participants have submitted
    const participants = await query(
      `SELECT * FROM room_participants WHERE room_id = ?`,
      [roomId]
    );

    const matchType = room.match_type;
    const allSubmitted = participants.every(p => p.status === 'submitted' || p.status === 'completed');

    if (allSubmitted) {
      // Finalize match
      await query(
        `UPDATE match_rooms SET status = 'completed', ended_at = NOW() WHERE id = ?`,
        [roomId]
      );

      // Determine winner for 1v1
      if (matchType === '1v1' && participants.length === 2) {
        // Fetch scores to determine winner
        const scores = await query(
          `SELECT user_id, test_cases_passed, execution_time_ms FROM match_scores WHERE room_id = ?`,
          [roomId]
        );

        let winnerId = null;
        let loserId = null;

        const p1 = scores[0];
        const p2 = scores[1];

        // Ensure both participants have scores
        if (p1 && p2) {
          // Logic: Most test cases passed, then fastest time
          if (p1.test_cases_passed > p2.test_cases_passed) {
            winnerId = p1.user_id;
            loserId = p2.user_id;
          } else if (p2.test_cases_passed > p1.test_cases_passed) {
            winnerId = p2.user_id;
            loserId = p1.user_id;
          } else {
            // Tie on test cases, check time
            if (p1.execution_time_ms < p2.execution_time_ms) {
              winnerId = p1.user_id;
              loserId = p2.user_id;
            } else {
              winnerId = p2.user_id;
              loserId = p1.user_id;
            }
          }

          if (winnerId && loserId) {
            try {
              const ratings = await processMatchResult(roomId, winnerId, loserId);
              // Update match room with winner
              await query(`UPDATE match_rooms SET winner_id = ? WHERE id = ?`, [winnerId, roomId]);
              console.log('ELO updated:', ratings);
            } catch (eloErr) {
              console.error('Failed to update ELO:', eloErr);
            }
          }
        }
      }
    }

    return { success: true, result: executionResult };
  } catch (error) {
    console.error('Error submitting code:', error);
    throw error;
  }
};

// Run code for a participant (without submitting)
export const runCode = async (roomId, userId, code, language) => {
  try {
    console.log(`[Service:Run] Executing code for room ${roomId}, User ${userId}, Lang: ${language}`);

    // Get room and problem info
    const rooms = await query(`SELECT * FROM match_rooms WHERE id = ?`, [roomId]);
    if (rooms.length === 0) throw new Error('Room not found');
    const room = rooms[0];

    // Get problem test cases
    const problems = await query(`SELECT hidden_test_cases FROM coding_questions WHERE id = ?`, [room.problem_id]);

    let testCases = [];
    if (problems.length > 0) {
      testCases = problems[0].hidden_test_cases || [];
    }

    console.log(`[Service:Run] Found ${testCases.length} test cases. Running...`);

    // Execute code server-side against all test cases
    const { runTestSuite } = await import('./compiler.js');
    const executionResult = await runTestSuite(code, language, testCases);

    console.log(`[Service:Run] Execution complete. Success: ${true}`);

    return { success: true, result: executionResult };
  } catch (error) {
    console.error('Error running code:', error);
    throw error;
  }
};

// Get leaderboard for completed match
export const getMatchLeaderboard = async (roomId) => {
  try {
    const scores = await query(
      `SELECT 
        ms.user_id,
        ms.team_number,
        ms.test_cases_passed,
        ms.test_cases_total,
        ms.execution_time_ms,
        ms.score,
        rp.status
       FROM match_scores ms
       LEFT JOIN room_participants rp ON ms.room_id = rp.room_id AND ms.user_id = rp.user_id
       WHERE ms.room_id = ?
       ORDER BY ms.score DESC, ms.execution_time_ms ASC`,
      [roomId]
    );

    return scores;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

export default {
  createRoom,
  joinRoom,
  getRoomState,
  leaveRoom,
  updateParticipantStatus,
  startMatch,
  submitCode,
  runCode,
  getMatchLeaderboard,
  findAvailableRoom
};
