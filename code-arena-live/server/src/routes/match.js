/**
 * Match Room Routes
 * Endpoints for creating, joining, and managing friendly coding matches
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createRoom,
  joinRoom,
  getRoomState,
  leaveRoom,
  updateParticipantStatus,
  startMatch,
  submitCode,
  runCode,
  getMatchLeaderboard
} from '../services/matchRoom.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/match/room/create
 * Create a new match room
 * Body: { matchType: '1v1' | '2v2', problemId?: number, language?: string, level?: string, timing?: number, invites?: array }
 */
router.post('/room/create', async (req, res) => {
  try {
    const { matchType = '1v1', problemId, language, level, timing, invites } = req.body;
    const userId = req.userId;

    // Validate match type
    if (!['1v1', '2v2'].includes(matchType)) {
      return res.status(400).json({ error: 'Invalid match type. Must be 1v1 or 2v2' });
    }

    const result = await createRoom(userId, matchType, problemId, {
      language: language || 'javascript',
      level: level || 'medium',
      timing: timing || 30,
      invites: invites || []
    });
    res.status(201).json({
      success: true,
      ...result,
      message: `Room created! Share code ${result.roomCode} with your friend`
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * POST /api/match/room/join
 * Join an existing match room
 * Body: { roomCode: string }
 */
router.post('/room/join', async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.userId;

    // Validate room code format
    if (!roomCode || !/^\d{4}$/.test(roomCode)) {
      return res.status(400).json({ error: 'Invalid room code format. Must be 4 digits' });
    }

    const result = await joinRoom(roomCode, userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(200).json({
      success: true,
      ...result,
      message: 'Successfully joined the room!'
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

/**
 * GET /api/match/room/:roomId
 * Get current room state
 */
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    const roomState = await getRoomState(roomId);
    if (!roomState) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      success: true,
      room: roomState
    });
  } catch (error) {
    console.error('Error getting room state:', error);
    res.status(500).json({ error: 'Failed to get room state' });
  }
});

/**
 * POST /api/match/room/:roomId/leave
 * Leave a room
 */
router.post('/room/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    const result = await leaveRoom(roomId, userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Successfully left the room'
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

/**
 * POST /api/match/room/:roomId/start
 * Start the match (only host can do this)
 * Body: { problemId?: number }
 */
router.post('/room/:roomId/start', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { problemId } = req.body;
    const userId = req.userId;

    const result = await startMatch(roomId, userId, problemId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Match started!'
    });
  } catch (error) {
    console.error('Error starting match:', error);
    res.status(500).json({ error: 'Failed to start match' });
  }
});

/**
 * POST /api/match/room/:roomId/submit
 * Submit code for the match
 * Body: { code: string, language: string }
 */
router.post('/room/:roomId/submit', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;
    const userId = req.userId;

    // Log request for debugging
    console.log(`[Submit] Request for room ${roomId} by user ${userId}`);
    // console.log('[Submit] Payload:', { language, codeLength: code?.length });

    if (!code) {
      console.warn('[Submit] Missing code in payload');
      return res.status(400).json({ error: 'Code is required' });
    }

    // Server-side execution now
    const result = await submitCode(roomId, userId, code, language);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Code submitted successfully',
      result: result.result
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
});

/**
 * POST /api/match/room/:roomId/run
 * Run code for the match (test only)
 * Body: { code: string, language: string }
 */
router.post('/room/:roomId/run', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language } = req.body;
    const userId = req.userId;

    // Log request for debugging
    console.log(`[Run] Request for room ${roomId} by user ${userId}`);
    // console.log('[Run] Payload:', { language, codeLength: code?.length });

    if (!code) {
      console.warn('[Run] Missing code in payload');
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await runCode(roomId, userId, code, language);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Code executed successfully',
      result: result.result
    });
  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({ error: 'Failed to run code' });
  }
});

/**
 * GET /api/match/room/:roomId/leaderboard
 * Get match leaderboard
 */
router.get('/room/:roomId/leaderboard', async (req, res) => {
  try {
    const { roomId } = req.params;

    const leaderboard = await getMatchLeaderboard(roomId);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * POST /api/match/room/:roomId/status
 * Update participant status
 * Body: { status: 'joined' | 'ready' | 'coding' | 'submitted' | 'completed' }
 */
router.post('/room/:roomId/status', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    const validStatuses = ['joined', 'ready', 'coding', 'submitted', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await updateParticipantStatus(roomId, userId, status);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Status updated'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
