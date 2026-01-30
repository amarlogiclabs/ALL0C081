import { useState, useEffect, useCallback, useRef } from "react";

export type BattleEvent = 
  | { type: "USER_JOINED"; userId: string; username: string; timestamp: number }
  | { type: "MATCH_FOUND"; battleId: string; opponent: { username: string; elo: number; tier: string }; timestamp: number }
  | { type: "BATTLE_START"; problem: { id: string; title: string }; timestamp: number }
  | { type: "OPPONENT_TYPING"; timestamp: number }
  | { type: "OPPONENT_SUBMITTED"; submissionId: string; timestamp: number }
  | { type: "JUDGE_RESULT"; submissionId: string; verdict: "AC" | "WA" | "TLE" | "RE"; isOpponent: boolean; timestamp: number }
  | { type: "BATTLE_END"; winner: string; eloChange: number; timestamp: number }
  | { type: "ELO_UPDATED"; newElo: number; change: number; timestamp: number }
  | { type: "OPPONENT_DISCONNECTED"; timestamp: number }
  | { type: "OPPONENT_RECONNECTED"; timestamp: number }
  | { type: "TIME_WARNING"; remainingSeconds: number; timestamp: number };

interface WebSocketSimulationOptions {
  battleId?: string;
  enabled?: boolean;
  onEvent?: (event: BattleEvent) => void;
}

interface WebSocketState {
  connected: boolean;
  events: BattleEvent[];
  opponentStatus: "idle" | "typing" | "submitted" | "judging" | "disconnected";
  opponentSubmissions: Array<{
    id: string;
    verdict: "pending" | "judging" | "AC" | "WA" | "TLE" | "RE";
    time: string;
  }>;
}

export function useWebSocketSimulation(options: WebSocketSimulationOptions = {}) {
  const { battleId, enabled = true, onEvent } = options;
  
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    events: [],
    opponentStatus: "idle",
    opponentSubmissions: [],
  });

  const eventQueueRef = useRef<BattleEvent[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const addEvent = useCallback((event: BattleEvent) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }));
    onEvent?.(event);
  }, [onEvent]);

  const simulateOpponentActivity = useCallback(() => {
    if (!enabled) return;

    // Random opponent actions
    const actions = [
      () => {
        setState((prev) => ({ ...prev, opponentStatus: "typing" }));
        addEvent({ type: "OPPONENT_TYPING", timestamp: Date.now() });
        
        // Stop typing after a bit
        setTimeout(() => {
          setState((prev) => ({ 
            ...prev, 
            opponentStatus: prev.opponentStatus === "typing" ? "idle" : prev.opponentStatus 
          }));
        }, 2000 + Math.random() * 3000);
      },
      () => {
        const submissionId = `sub_${Date.now()}`;
        setState((prev) => ({
          ...prev,
          opponentStatus: "submitted",
          opponentSubmissions: [
            { id: submissionId, verdict: "judging", time: formatTime(Date.now()) },
            ...prev.opponentSubmissions,
          ],
        }));
        addEvent({ type: "OPPONENT_SUBMITTED", submissionId, timestamp: Date.now() });

        // Simulate judging delay
        setTimeout(() => {
          const verdicts: Array<"AC" | "WA" | "TLE" | "RE"> = ["WA", "TLE", "WA", "RE", "WA"];
          const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
          
          setState((prev) => ({
            ...prev,
            opponentStatus: "idle",
            opponentSubmissions: prev.opponentSubmissions.map((s) =>
              s.id === submissionId ? { ...s, verdict } : s
            ),
          }));
          addEvent({ 
            type: "JUDGE_RESULT", 
            submissionId, 
            verdict, 
            isOpponent: true, 
            timestamp: Date.now() 
          });
        }, 2000 + Math.random() * 3000);
      },
    ];

    // 30% chance of opponent activity every interval
    if (Math.random() < 0.3) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      action();
    }
  }, [enabled, addEvent]);

  // Connect simulation
  useEffect(() => {
    if (!enabled || !battleId) return;

    // Simulate connection
    const connectTimeout = setTimeout(() => {
      setState((prev) => ({ ...prev, connected: true }));
      addEvent({ 
        type: "BATTLE_START", 
        problem: { id: "1", title: "Two Sum" }, 
        timestamp: Date.now() 
      });
    }, 500);

    // Start opponent activity simulation
    intervalRef.current = setInterval(simulateOpponentActivity, 5000 + Math.random() * 10000);

    return () => {
      clearTimeout(connectTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, battleId, simulateOpponentActivity, addEvent]);

  // Simulate user submission
  const submitCode = useCallback((code: string, language: string) => {
    const submissionId = `sub_user_${Date.now()}`;
    
    addEvent({ 
      type: "OPPONENT_SUBMITTED", 
      submissionId, 
      timestamp: Date.now() 
    });

    return new Promise<{ verdict: "AC" | "WA" | "TLE" | "RE"; message: string }>((resolve) => {
      // Simulate judging time
      setTimeout(() => {
        // Simulate different verdicts based on code content
        let verdict: "AC" | "WA" | "TLE" | "RE" = "WA";
        let message = "";

        if (code.includes("for") && code.includes("return")) {
          if (code.length > 200) {
            verdict = "AC";
            message = "All test cases passed!";
          } else if (code.includes("while(true)") || code.includes("while (true)")) {
            verdict = "TLE";
            message = "Time limit exceeded on test case 3";
          } else {
            verdict = "WA";
            message = "Wrong answer on test case 2. Expected: [1,2], Got: [0,1]";
          }
        } else if (code.includes("undefined") || code.includes("null.")) {
          verdict = "RE";
          message = "Runtime Error: Cannot read property of undefined";
        } else {
          verdict = "WA";
          message = "Wrong answer on test case 1";
        }

        addEvent({ 
          type: "JUDGE_RESULT", 
          submissionId, 
          verdict, 
          isOpponent: false, 
          timestamp: Date.now() 
        });

        resolve({ verdict, message });
      }, 2000 + Math.random() * 2000);
    });
  }, [addEvent]);

  const disconnect = useCallback(() => {
    setState((prev) => ({ ...prev, connected: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  return {
    ...state,
    submitCode,
    disconnect,
  };
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getMinutes()}:${date.getSeconds().toString().padStart(2, "0")}`;
}
