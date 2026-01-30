import { io, Socket } from 'socket.io-client';

export type BattleEventType =
  | 'BATTLE_START'
  | 'OPPONENT_TYPING'
  | 'OPPONENT_SUBMITTED'
  | 'JUDGE_RESULT'
  | 'BATTLE_END'
  | 'OPPONENT_DISCONNECTED'
  | 'CODE_UPDATE'
  | 'opponent-connected';

export interface BattleMessage {
  type: BattleEventType;
  userId: string;
  battleId: string;
  data?: any;
  timestamp: number;
}

export interface BattleParticipant {
  userId: string;
  username: string;
  elo: number;
  tier: string;
  avatar: string;
}

class BattleWebSocketService {
  private socket: Socket | null = null;
  private url: string = '';
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnected = false;

  connect(battleId: string, userId: string, token: string | null) {
    const baseUrl = import.meta.env.VITE_WS_URL || ''; // Socket.IO uses http/https
    // Socket.IO namespace for battle
    const namespace = '/battle';

    // Connect options
    const options = {
      query: {
        userId,
        token: token || '',
        battleId
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    };

    console.log(`Connecting to Socket.IO: ${baseUrl}${namespace}`);
    this.socket = io(`${baseUrl}${namespace}`, options);

    this.socket.on('connect', () => {
      console.log('Socket.IO connected to battle:', battleId);
      this.isConnected = true;
      this.emit('connected', { battleId });

      // Join room explicitly if needed, though query param often handles it in server checks
      this.socket?.emit('join', { battleId, userId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.emit('error', error);
    });

    // Listen to specific server events and bridge them to internal emitter
    this.listenToEvent('opponent-connected');
    this.listenToEvent('CODE_UPDATE');
    this.listenToEvent('OPPONENT_SUBMITTED');
    this.listenToEvent('JUDGE_RESULT');
    this.listenToEvent('BATTLE_END');
    this.listenToEvent('OPPONENT_DISCONNECTED');
  }

  private listenToEvent(eventName: string) {
    if (!this.socket) return;

    this.socket.on(eventName, (data: any) => {
      console.log(`Received ${eventName}:`, data);

      // normalize to BattleMessage structure if needed, or pass through
      // The server sends { userId, code, language, ... }
      // We want to wrap it in a structure that matches BattleMessage if possible
      // But useBattleWebSocket expects the raw event structure roughly

      const message: BattleMessage = {
        type: eventName as BattleEventType,
        userId: data.userId,
        battleId: this.socket?.id || '', // Start doesn't send battleId usually
        data: data, // Keep original data in data field
        timestamp: data.timestamp || Date.now()
      };

      // Also emit strictly with the type name
      this.emit(eventName, message);
      // And wildcards
      this.emit('*', message);
    });
  }

  send(eventType: string, data: any) {
    if (this.isConnected && this.socket) {
      this.socket.emit(eventType, data);
    } else {
      console.warn('Socket.IO not connected. Message dropped.');
    }
  }

  on(eventType: string, listener: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  off(eventType: string, listener: Function) {
    this.listeners.get(eventType)?.delete(listener);
  }

  private emit(eventType: string, data: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in listener for ${eventType}:`, error);
        }
      });
    }

    // Also emit to wildcard listeners (except for internal events usually, but here we want all)
    if (eventType !== '*') {
      const allListeners = this.listeners.get('*');
      if (allListeners) {
        allListeners.forEach((listener) => {
          try {
            listener(data);
          } catch (error) {
            console.error(`Error in wildcard listener:`, error);
          }
        });
      }
    }
  }

  sendCodeUpdate(battleId: string, userId: string, code: string, language: string) {
    this.send('CODE_UPDATE', {
      battleId,
      userId,
      code,
      language
    });
  }

  submitCode(battleId: string, userId: string, code: string, language: string) {
    this.send('OPPONENT_SUBMITTED', {
      battleId,
      userId,
      code,
      language
    });
  }

  endBattle(battleId: string, userId: string, result: 'win' | 'loss' | 'draw') {
    this.send('BATTLE_END', {
      battleId,
      userId,
      winner: userId, // Logic might differ based on result
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const battleWsService = new BattleWebSocketService();
