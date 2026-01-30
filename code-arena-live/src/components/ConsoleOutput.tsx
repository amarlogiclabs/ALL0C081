import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Terminal, CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from "lucide-react";

export interface ConsoleMessage {
  id: string;
  type: "info" | "success" | "error" | "warning" | "system";
  content: string;
  timestamp: number;
}

interface ConsoleOutputProps {
  messages: ConsoleMessage[];
  isRunning?: boolean;
  className?: string;
}

function MessageIcon({ type }: { type: ConsoleMessage["type"] }) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />;
    case "error":
      return <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />;
    case "warning":
      return <Clock className="w-3.5 h-3.5 text-warning shrink-0" />;
    case "system":
      return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
    default:
      return <Terminal className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
  }
}

function getMessageColor(type: ConsoleMessage["type"]): string {
  switch (type) {
    case "success":
      return "text-success";
    case "error":
      return "text-destructive";
    case "warning":
      return "text-warning";
    case "system":
      return "text-accent";
    default:
      return "text-foreground";
  }
}

export function ConsoleOutput({ messages, isRunning, className }: ConsoleOutputProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="h-9 border-b border-border flex items-center px-4 gap-2 bg-card/50 shrink-0">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Console</span>
        {isRunning && (
          <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Running...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-1"
      >
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Run your code to see output here...
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-2 py-0.5 animate-fade-in",
                message.type === "success" && "bg-success/5 -mx-3 px-3 rounded",
                message.type === "error" && "bg-destructive/5 -mx-3 px-3 rounded"
              )}
            >
              <MessageIcon type={message.type} />
              <pre className={cn(
                "whitespace-pre-wrap break-all text-xs leading-relaxed",
                getMessageColor(message.type)
              )}>
                {message.content}
              </pre>
            </div>
          ))
        )}
        
        {isRunning && (
          <div className="flex items-center gap-2 py-1 text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Executing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to create console messages
export function createConsoleMessage(
  type: ConsoleMessage["type"],
  content: string
): ConsoleMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    content,
    timestamp: Date.now(),
  };
}
