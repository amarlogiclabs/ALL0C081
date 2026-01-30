import { useEffect, useState, useCallback } from 'react';
import { battleWsService, BattleMessage } from '@/lib/websocket';
import { useAuth } from '@/contexts/AuthContext';

export interface OpponentStatus {
  userId: string;
  username: string;
  status: 'idle' | 'coding' | 'submitted' | 'judging' | 'disconnected';
  lastUpdate: number;
}

export const useBattleWebSocket = (battleId: string, enabled: boolean = true) => {
  const { user, session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState<OpponentStatus | null>(null);
  const [events, setEvents] = useState<BattleMessage[]>([]);
  const [opponentCode, setOpponentCode] = useState<string>('');

  useEffect(() => {
    if (!enabled || !user || !battleId) {
      return;
    }

    // Connect to WebSocket
    const token = session?.token || localStorage.getItem('auth_token');
    battleWsService.connect(battleId, user.id, token);

    // Listen to events
    const unsubscribeConnected = battleWsService.on('connected', () => {
      setIsConnected(true);
      console.log('Battle WebSocket connected');
    });

    const unsubscribeDisconnected = battleWsService.on('disconnected', () => {
      setIsConnected(false);
      setOpponentStatus(prev => prev ? { ...prev, status: 'disconnected' } : null);
    });

    const unsubscribeEvent = battleWsService.on('*', (event: BattleMessage) => {
      if (event.userId !== user.id) {
        // Handle opponent event
        handleOpponentEvent(event);
      }
      setEvents(prev => [...prev, event]);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeEvent();
      battleWsService.disconnect();
    };
  }, [enabled, user, battleId]);

  const handleOpponentEvent = (event: BattleMessage) => {
    if (event.type === 'CODE_UPDATE') {
      setOpponentStatus(prev => prev ? { ...prev, status: 'coding', lastUpdate: event.timestamp } : null);
      if (event.data?.code) {
        setOpponentCode(event.data.code);
      }
    } else if (event.type === 'OPPONENT_SUBMITTED') {
      setOpponentStatus(prev => prev ? { ...prev, status: 'submitted', lastUpdate: event.timestamp } : null);
    } else if (event.type === 'JUDGE_RESULT') {
      setOpponentStatus(prev => prev ? { ...prev, status: 'judging', lastUpdate: event.timestamp } : null);
    }
  };

  const sendCodeUpdate = useCallback((code: string, language: string) => {
    if (user && isConnected) {
      battleWsService.sendCodeUpdate(battleId, user.id, code, language);
    }
  }, [battleId, user, isConnected]);

  const submitCode = useCallback((code: string, language: string) => {
    if (user && isConnected) {
      battleWsService.submitCode(battleId, user.id, code, language);
    }
  }, [battleId, user, isConnected]);

  const endBattle = useCallback((result: 'win' | 'loss' | 'draw') => {
    if (user && isConnected) {
      battleWsService.endBattle(battleId, user.id, result);
    }
  }, [battleId, user, isConnected]);

  return {
    isConnected,
    opponentStatus,
    opponentCode,
    events,
    sendCodeUpdate,
    submitCode,
    endBattle,
  };
};
