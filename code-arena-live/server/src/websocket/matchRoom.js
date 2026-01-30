/**
 * Match Room WebSocket Handler
 * Manages real-time updates for room state, participants, and match events
 */

import { getRoomState, getMatchLeaderboard } from '../services/matchRoom.js';

const activeRooms = new Map(); // roomId -> Set of socket ids

export const setupMatchWebSocket = (io) => {
  const matchNamespace = io.of('/match-room');
  
  matchNamespace.on('connection', (socket) => {
    console.log(`[Match] User connected: ${socket.id}`);
    
    /**
     * Join a room's WebSocket channel
     * Data: { roomId, userId }
     */
    socket.on('join-room', async (data) => {
      try {
        const { roomId, userId } = data;
        
        if (!roomId) {
          socket.emit('error', { message: 'Room ID required' });
          return;
        }
        
        // Add to room channel
        socket.join(`room:${roomId}`);
        
        // Track active rooms
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Set());
        }
        activeRooms.get(roomId).add(socket.id);
        
        // Store room info on socket
        socket.roomId = roomId;
        socket.userId = userId;
        
        // Get current room state
        const roomState = await getRoomState(roomId);
        
        // Notify others that user joined
        matchNamespace.to(`room:${roomId}`).emit('user-joined', {
          userId,
          timestamp: new Date(),
          totalParticipants: roomState.participantCount,
          participants: roomState.participants
        });
        
        // Send room state to the joining user
        socket.emit('room-state', roomState);
        
        console.log(`[Match] User ${userId} joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });
    
    /**
     * Participant ready status
     * Data: { roomId, userId }
     */
    socket.on('ready', async (data) => {
      try {
        const { roomId, userId } = data;
        
        // Notify other participants
        matchNamespace.to(`room:${roomId}`).emit('participant-ready', {
          userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in ready event:', error);
      }
    });
    
    /**
     * Match started event
     * Data: { roomId, problemId, problemStatement }
     */
    socket.on('match-started', (data) => {
      try {
        const { roomId, problemId, problemStatement } = data;
        
        // Broadcast to all in room
        matchNamespace.to(`room:${roomId}`).emit('match-started', {
          problemId,
          problemStatement,
          startedAt: new Date()
        });
      } catch (error) {
        console.error('Error in match-started event:', error);
      }
    });
    
    /**
     * Code being typed (for live collaboration view)
     * Data: { roomId, userId, code, language }
     */
    socket.on('code-update', (data) => {
      try {
        const { roomId, userId, code, language } = data;
        
        // Broadcast to others in room (not back to sender)
        socket.to(`room:${roomId}`).emit('code-updated', {
          userId,
          codeLength: code?.length || 0,
          language,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in code-update event:', error);
      }
    });
    
    /**
     * Code execution started
     * Data: { roomId, userId, language }
     */
    socket.on('code-executing', (data) => {
      try {
        const { roomId, userId, language } = data;
        
        socket.to(`room:${roomId}`).emit('participant-executing', {
          userId,
          language,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in code-executing event:', error);
      }
    });
    
    /**
     * Code submission
     * Data: { roomId, userId, testsPassed, testsTotal, executionTime }
     */
    socket.on('code-submitted', (data) => {
      try {
        const { roomId, userId, testsPassed, testsTotal, executionTime } = data;
        
        matchNamespace.to(`room:${roomId}`).emit('submission-received', {
          userId,
          testsPassed,
          testsTotal,
          executionTime,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in code-submitted event:', error);
      }
    });
    
    /**
     * Request room state refresh
     * Data: { roomId }
     */
    socket.on('refresh-state', async (data) => {
      try {
        const { roomId } = data;
        const roomState = await getRoomState(roomId);
        socket.emit('room-state', roomState);
      } catch (error) {
        console.error('Error refreshing state:', error);
        socket.emit('error', { message: 'Failed to refresh room state' });
      }
    });
    
    /**
     * Request leaderboard
     * Data: { roomId }
     */
    socket.on('get-leaderboard', async (data) => {
      try {
        const { roomId } = data;
        const leaderboard = await getMatchLeaderboard(roomId);
        socket.emit('leaderboard', leaderboard);
      } catch (error) {
        console.error('Error getting leaderboard:', error);
        socket.emit('error', { message: 'Failed to get leaderboard' });
      }
    });
    
    /**
     * Message in chat (optional feature)
     * Data: { roomId, userId, username, message }
     */
    socket.on('chat-message', (data) => {
      try {
        const { roomId, userId, username, message } = data;
        
        if (!message || message.trim().length === 0) {
          return;
        }
        
        matchNamespace.to(`room:${roomId}`).emit('new-message', {
          userId,
          username,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in chat-message event:', error);
      }
    });
    
    /**
     * Leave room
     */
    socket.on('leave-room', async (data) => {
      try {
        const { roomId, userId } = data;
        
        socket.leave(`room:${roomId}`);
        
        if (activeRooms.has(roomId)) {
          activeRooms.get(roomId).delete(socket.id);
          if (activeRooms.get(roomId).size === 0) {
            activeRooms.delete(roomId);
          }
        }
        
        // Notify others
        matchNamespace.to(`room:${roomId}`).emit('user-left', {
          userId,
          timestamp: new Date()
        });
        
        console.log(`[Match] User ${userId} left room ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });
    
    /**
     * Disconnect handling
     */
    socket.on('disconnect', () => {
      try {
        const { roomId, userId } = socket;
        
        if (roomId && activeRooms.has(roomId)) {
          activeRooms.get(roomId).delete(socket.id);
          if (activeRooms.get(roomId).size === 0) {
            activeRooms.delete(roomId);
          }
          
          // Notify others of disconnect
          if (activeRooms.get(roomId)?.size > 0) {
            matchNamespace.to(`room:${roomId}`).emit('user-disconnected', {
              userId,
              timestamp: new Date()
            });
          }
        }
        
        console.log(`[Match] User disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
  
  return matchNamespace;
};

/**
 * Battle WebSocket Handler
 * Manages real-time events for 1v1 battles
 */
export const setupBattleWebSocket = (io) => {
  const battleNamespace = io.of('/battle');
  
  battleNamespace.on('connection', (socket) => {
    console.log(`[Battle] User connected: ${socket.id}`);
    
    socket.on('join', (data) => {
      const { battleId, userId } = data;
      socket.join(battleId);
      socket.battleId = battleId;
      socket.userId = userId;
      
      console.log(`[Battle] User ${userId} joined battle ${battleId}`);
      socket.to(battleId).emit('opponent-connected', { userId });
    });
    
    socket.on('CODE_UPDATE', (data) => {
      const { battleId, code, language } = data;
      socket.to(battleId).emit('CODE_UPDATE', {
        userId: socket.userId,
        code,
        language,
        timestamp: Date.now()
      });
    });
    
    socket.on('OPPONENT_SUBMITTED', (data) => {
      const { battleId, code, language } = data;
      socket.to(battleId).emit('OPPONENT_SUBMITTED', {
        userId: socket.userId,
        code,
        language,
        timestamp: Date.now()
      });
    });
    
    socket.on('JUDGE_RESULT', (data) => {
      const { battleId, result } = data;
      socket.to(battleId).emit('JUDGE_RESULT', {
        userId: socket.userId,
        result,
        timestamp: Date.now()
      });
    });
    
    socket.on('BATTLE_END', (data) => {
      const { battleId, winner } = data;
      battleNamespace.to(battleId).emit('BATTLE_END', {
        winner,
        timestamp: Date.now()
      });
    });
    
    socket.on('disconnect', () => {
      if (socket.battleId && socket.userId) {
        socket.to(socket.battleId).emit('OPPONENT_DISCONNECTED', {
          userId: socket.userId,
          timestamp: Date.now()
        });
        console.log(`[Battle] User ${socket.userId} disconnected from battle ${socket.battleId}`);
      }
    });
  });
  
  return battleNamespace;
};

export default setupMatchWebSocket;
