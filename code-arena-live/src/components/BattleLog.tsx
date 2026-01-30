import { useEffect, useRef } from "react";
import { BattleEvent } from "@/hooks/useWebSocketSimulation";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Wifi,
  WifiOff,
  Trophy,
  Keyboard
} from "lucide-react";

interface BattleLogProps {
  events: BattleEvent[];
  className?: string;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function EventIcon({ type, verdict }: { type: string; verdict?: string }) {
  switch (type) {
    case "BATTLE_START":
      return <Zap className="w-4 h-4 text-accent" />;
    case "OPPONENT_TYPING":
      return <Keyboard className="w-4 h-4 text-muted-foreground" />;
    case "OPPONENT_SUBMITTED":
      return <Send className="w-4 h-4 text-primary" />;
    case "JUDGE_RESULT":
      switch (verdict) {
        case "AC":
          return <CheckCircle2 className="w-4 h-4 text-success" />;
        case "WA":
          return <XCircle className="w-4 h-4 text-destructive" />;
        case "TLE":
          return <Clock className="w-4 h-4 text-warning" />;
        case "RE":
          return <AlertCircle className="w-4 h-4 text-destructive" />;
        default:
          return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      }
    case "OPPONENT_DISCONNECTED":
      return <WifiOff className="w-4 h-4 text-warning" />;
    case "OPPONENT_RECONNECTED":
      return <Wifi className="w-4 h-4 text-success" />;
    case "BATTLE_END":
      return <Trophy className="w-4 h-4 text-tier-luminary" />;
    case "TIME_WARNING":
      return <Clock className="w-4 h-4 text-warning animate-pulse" />;
    default:
      return <Zap className="w-4 h-4 text-muted-foreground" />;
  }
}

function getEventMessage(event: BattleEvent): string {
  switch (event.type) {
    case "BATTLE_START":
      return `Battle started! Problem: ${event.problem.title}`;
    case "OPPONENT_TYPING":
      return "Opponent is typing...";
    case "OPPONENT_SUBMITTED":
      return "Opponent submitted a solution";
    case "JUDGE_RESULT":
      const verdictText = {
        AC: "Accepted",
        WA: "Wrong Answer",
        TLE: "Time Limit Exceeded",
        RE: "Runtime Error",
      }[event.verdict];
      return event.isOpponent 
        ? `Opponent: ${verdictText}` 
        : `Your submission: ${verdictText}`;
    case "OPPONENT_DISCONNECTED":
      return "Opponent disconnected";
    case "OPPONENT_RECONNECTED":
      return "Opponent reconnected";
    case "BATTLE_END":
      return `Battle ended! Winner: ${event.winner}`;
    case "TIME_WARNING":
      return `Warning: ${Math.floor(event.remainingSeconds / 60)} minutes remaining!`;
    default:
      return "Event occurred";
  }
}

function getEventColor(event: BattleEvent): string {
  switch (event.type) {
    case "BATTLE_START":
      return "text-accent";
    case "JUDGE_RESULT":
      if (event.verdict === "AC") return "text-success";
      if (event.verdict === "WA" || event.verdict === "RE") return "text-destructive";
      return "text-warning";
    case "OPPONENT_DISCONNECTED":
      return "text-warning";
    case "BATTLE_END":
      return "text-tier-luminary";
    case "TIME_WARNING":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
}

export function BattleLog({ events, className }: BattleLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <h3 className="text-sm font-medium mb-3 px-1">Battle Log</h3>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-2"
      >
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Waiting for events...
          </p>
        ) : (
          events.map((event, index) => (
            <div
              key={`${event.type}-${event.timestamp}-${index}`}
              className={cn(
                "flex items-start gap-2 p-2 rounded-lg bg-secondary/30 text-xs animate-fade-in",
                event.type === "JUDGE_RESULT" && event.verdict === "AC" && !event.isOpponent && "bg-success/10 border border-success/20",
                event.type === "BATTLE_END" && "bg-tier-luminary/10 border border-tier-luminary/20"
              )}
            >
              <div className="mt-0.5">
                <EventIcon type={event.type} verdict={(event as any).verdict} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("leading-tight", getEventColor(event))}>
                  {getEventMessage(event)}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {formatTimestamp(event.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
