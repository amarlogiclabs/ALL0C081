import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CodeEditor, Language, languages, getDefaultCode } from "@/components/CodeEditor";
import { useBattleWebSocket, OpponentStatus } from "@/hooks/useBattleWebSocket";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Play,
  Send,
  Clock,
  ChevronDown,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Verdict = "pending" | "judging" | "AC" | "WA" | "TLE" | "RE";

interface ConsoleMessage {
  id: string;
  type: "info" | "success" | "error" | "system";
  content: string;
}

export default function BattleArena() {
  const { id: battleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("python");
  const [code, setCode] = useState(getDefaultCode("python"));
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [battleTime, setBattleTime] = useState(30 * 60);
  const [myStatus, setMyStatus] = useState<"idle" | "coding" | "submitted" | "judging">("idle");
  const [problemData, setProblemData] = useState<any>(null);
  const [opponentData, setOpponentData] = useState<any>(null);
  const [isSpectating, setIsSpectating] = useState(false);
  const [showForfeitModal, setShowForfeitModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timerActive, setTimerActive] = useState(true);
  const [isAccepted, setIsAccepted] = useState(false);

  // WebSocket
  const {
    isConnected,
    opponentStatus,
    opponentCode,
    events,
    sendCodeUpdate,
    submitCode: wsSubmitCode
  } = useBattleWebSocket(battleId || "", !!battleId);

  // Prevent accidental tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Leaving this battle will result in a forfeit. Are you sure?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Battle timer countdown
  useEffect(() => {
    if (!timerActive) return;

    const interval = setInterval(() => {
      setBattleTime(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive]);

  // Fetch battle data
  useEffect(() => {
    const fetchBattleData = async () => {
      if (!battleId) return;

      try {
        const res = await api.get(`/api/match/room/${battleId}`);
        const data = await res.json();

        if (data.success && data.room) {
          const room = data.room;
          setProblemData({
            title: room.title,
            description: room.description,
            difficulty: room.difficulty,
            tags: room.tags || [],
            examples: room.examples || [],
            constraints: room.constraints || []
          });

          // Find opponent
          if (room.participants && user) {
            const opponent = room.participants.find((p: any) => p.user_id !== user.id);
            if (opponent) {
              // We need to fetch opponent profile details if not in participant list
              // For now, assume some details are there or fetch separately.
              // Assuming backend returns basic user info in participants logic (which we updated)
              // The getRoomState query needs to join user_profiles to get username/tier/etc.
              // If not, we might lack username. Let's assume username is present or fetch it.
              // Actually getRoomState returns just IDs mostly. 
              // For a quick fix, we'll use placeholder or fetch user.

              // Fetch opponent profile
              try {
                const oppRes = await api.get(`/api/users/${opponent.user_id}`);
                const oppData = await oppRes.json();
                if (oppData.success) {
                  setOpponentData(oppData.user);
                }
              } catch (e) {
                console.error("Failed to fetch opponent", e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching battle data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattleData();
  }, [battleId, user]);

  // Update code in WebSocket
  useEffect(() => {
    if (code && isConnected && !isSpectating) {
      const timer = setTimeout(() => {
        sendCodeUpdate(code, selectedLanguage);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [code, selectedLanguage, isConnected, sendCodeUpdate, isSpectating]);

  const addConsoleMessage = useCallback((type: ConsoleMessage["type"], content: string) => {
    setConsoleMessages((prev) => [...prev, {
      id: `msg_${Date.now()}_${Math.random()}`,
      type,
      content
    }]);
  }, []);

  const handleForfeit = async () => {
    if (!battleId) return;
    try {
      await api.post(`/api/match/room/${battleId}/leave`, {});
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to forfeit", error);
    }
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setSelectedLanguage(newLanguage);
    setCode(getDefaultCode(newLanguage));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setMyStatus("coding");
    setConsoleMessages([]);
    addConsoleMessage("system", "Compiling and running code...");

    try {
      const res = await api.post(`/api/match/room/${battleId}/run`, {
        battleId,
        code,
        language: selectedLanguage
      });
      const data = await res.json();

      if (data.success) {
        const { verdict, stdout, stderr, compileOutput, testResults, testCasesPassed, testCasesTotal } = data.result;

        if (compileOutput) {
          addConsoleMessage("info", `Compiler Output:\n${compileOutput}`);
        }

        if (stderr) {
          addConsoleMessage("error", `Standard Error:\n${stderr}`);
        }

        if (stdout) {
          addConsoleMessage("info", `Standard Output:\n${stdout}`);
        }

        if (verdict === 'ACCEPTED') {
          addConsoleMessage("success", `✓ Passed ${testCasesPassed}/${testCasesTotal} test cases.`);
        } else {
          addConsoleMessage("error", `✗ Verdict: ${verdict}`);
          addConsoleMessage("error", `Test Cases: ${testCasesPassed}/${testCasesTotal} passed`);
        }

        // Display individual test results
        if (testResults && testResults.length > 0) {
          addConsoleMessage("info", "\nTest Case Details:");
          testResults.forEach((tc: any) => {
            const status = tc.passed ? "✓" : "✗";
            const msgType = tc.passed ? "success" : "error";
            addConsoleMessage(msgType, `${status} Test ${tc.testCase}: ${tc.status}`);
          });
        }
      } else {
        addConsoleMessage("error", data.error || "Execution failed");
      }
    } catch (e) {
      addConsoleMessage("error", "Network error during execution");
    } finally {
      setIsRunning(false);
      setMyStatus("idle");
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMyStatus("submitted");
    setConsoleMessages([]);
    addConsoleMessage("system", "Submitting solution...");

    try {
      const res = await api.post(`/api/match/room/${battleId}/submit`, {
        code,
        language: selectedLanguage
      });
      const data = await res.json();

      if (data.success) {
        const { verdict, stdout, stderr, compileOutput, testResults, testCasesPassed, testCasesTotal, executionTime } = data.result;

        // Stop the timer after submission
        setTimerActive(false);

        if (compileOutput) {
          addConsoleMessage("info", `Compiler Output:\n${compileOutput}`);
        }

        if (stderr) {
          addConsoleMessage("error", `Errors:\n${stderr}`);
        }

        if (stdout) {
          addConsoleMessage("info", `Output:\n${stdout}`);
        }

        if (verdict === 'ACCEPTED') {
          addConsoleMessage("success", `✓ Accepted! Passed ${testCasesPassed}/${testCasesTotal} cases.`);
          setIsAccepted(true);
        } else {
          addConsoleMessage("error", `✗ Verdict: ${verdict}`);
          addConsoleMessage("error", `Test Cases: ${testCasesPassed}/${testCasesTotal} passed`);
          setIsAccepted(false);
        }

        // Display individual test results
        if (testResults && testResults.length > 0) {
          addConsoleMessage("info", "\nTest Case Details:");
          testResults.forEach((tc: any) => {
            const status = tc.passed ? "✓" : "✗";
            const msgType = tc.passed ? "success" : "error";
            addConsoleMessage(msgType, `${status} Test ${tc.testCase}: ${tc.status}`);
          });
        }

        addConsoleMessage("info", `Execution Time: ${executionTime || 0}ms`);

        wsSubmitCode(code, selectedLanguage);

        // Wait a moment then redirect to results
        setTimeout(() => {
          navigate(`/battle/results/${battleId}`);
        }, 1500);
      } else {
        addConsoleMessage("error", "Submission failed");
        setMyStatus("idle");
        setTimerActive(true); // Resume timer if submission failed
      }
    } catch (e) {
      addConsoleMessage("error", "Network error during submission");
      setMyStatus("idle");
      setTimerActive(true); // Resume timer if submission failed
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMyStatusText = () => {
    switch (myStatus) {
      case "coding": return "Coding...";
      case "submitted": return "Submitted";
      case "judging": return "Judging...";
      default: return "Idle";
    }
  };

  const formatBattleTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Battle...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Forfeit Modal */}
      <Dialog open={showForfeitModal} onOpenChange={setShowForfeitModal}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-500">
              <AlertTriangle className="mr-2" /> Warning: Forfeit Battle
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Leaving the battle now will result in an immediate <strong>LOSS</strong>.
              Your ELO rating will decrease, and this will be recorded in your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForfeitModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleForfeit}>Forfeit & Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Battle Header */}
      <header className="h-14 border-b border-border/50 bg-card flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-primary font-semibold">Live Battle</span>
          <span className="text-muted-foreground text-sm">Problem: {problemData?.title}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border",
            battleTime < 60 ? "border-destructive text-destructive" :
              battleTime < 300 ? "border-warning text-warning" : "border-primary/50 text-foreground"
          )}>
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold text-lg">{formatBattleTime(battleTime)}</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setShowForfeitModal(true)}
          >
            <LogOut className="w-4 h-4" /> Forfeit
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Statement */}
        <div className="w-[420px] border-r border-border/30 overflow-y-auto p-6 shrink-0 bg-card/50">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {problemData?.title || "Loading..."}
            </h1>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border",
                problemData?.difficulty === 'Easy' && "bg-success/20 text-success border-success/30",
                problemData?.difficulty === 'Medium' && "bg-warning/20 text-warning border-warning/30",
                problemData?.difficulty === 'Hard' && "bg-destructive/20 text-destructive border-destructive/30"
              )}>
                {problemData?.difficulty || "Medium"}
              </span>
              {problemData?.tags?.map((tag: string) => (
                <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-5 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              {problemData?.description || "Problem description..."}
            </p>

            {problemData?.examples && (
              <div>
                <h3 className="text-foreground font-semibold mb-3">Examples:</h3>
                {problemData.examples.map((example: any, idx: number) => (
                  <div key={idx} className="bg-secondary/50 border-l-2 border-primary p-4 rounded-r-lg font-mono text-sm space-y-1 mb-3">
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Input:</span> {example.input}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Output:</span> {example.output}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {problemData?.constraints && (
              <div>
                <h3 className="text-foreground font-semibold mb-3">Constraints:</h3>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {problemData.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">

          {/* Editor Header */}
          <div className="h-14 border-b border-border/30 flex items-center justify-between px-4 bg-card/50 shrink-0">
            {isSpectating ? (
              <div className="flex items-center gap-2 text-warning animate-pulse">
                <Eye className="w-4 h-4" />
                <span className="font-bold">Spectating Opponent</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  className="appearance-none bg-secondary border border-primary/30 text-foreground px-4 py-2 pr-10 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            )}

            {!isSpectating && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                  className="border-border/50 hover:bg-secondary"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Run
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting}
                  className={cn(
                    "text-primary-foreground",
                    isAccepted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-primary hover:bg-primary/90"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting
                    </>
                  ) : isAccepted ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Accepted
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className={cn(
                "w-full h-full transition-all duration-300",
                isSpectating && "blur-sm pointer-events-none select-none opacity-50"
              )}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <CodeEditor
                language={selectedLanguage}
                value={isSpectating ? opponentCode : code}
                onChange={setCode}
                readOnly={isSpectating || isSubmitting}
              />
            </div>

            {/* Spectator Overlay */}
            {isSpectating && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="bg-background/90 border border-warning/50 p-6 rounded-xl flex flex-col items-center gap-3 shadow-2xl backdrop-blur-md">
                  <Lock className="w-12 h-12 text-warning mb-2" />
                  <h3 className="text-xl font-bold text-foreground">Opponent Code Obfuscated</h3>
                  <p className="text-muted-foreground text-center max-w-xs">
                    Anti-cheat protection active. You can see their progress but logic is hidden.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Console */}
          {!isSpectating && (
            <div className="h-40 border-t border-border/30 shrink-0 bg-card/80">
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 border-b border-border/30">
                  <span className="text-sm font-medium text-muted-foreground">Console</span>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                  {consoleMessages.length === 0 ? (
                    <span className="text-muted-foreground">Run your code to see output here...</span>
                  ) : (
                    consoleMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "whitespace-pre-wrap",
                          msg.type === "success" && "text-success",
                          msg.type === "error" && "text-destructive",
                          msg.type === "system" && "text-primary",
                          msg.type === "info" && "text-foreground"
                        )}
                      >
                        {msg.content}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Opponent & Battle Log */}
        <div className="w-80 border-l border-border/30 flex flex-col shrink-0 bg-card/50">
          {/* Your Status */}
          <div className="p-5 border-b border-border/30">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">You</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-foreground">
                {userProfile?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{userProfile?.username || 'You'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-primary font-mono">{userProfile?.elo || 1200}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                myStatus === "coding" ? "bg-success animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-sm text-muted-foreground">{getMyStatusText()}</span>
            </div>
          </div>

          {/* Opponent Status */}
          <div className="p-5 border-b border-border/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Opponent</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsSpectating(!isSpectating)}
                title={isSpectating ? "Stop Spectating" : "Spectate Opponent"}
              >
                {isSpectating ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                {opponentData?.username?.charAt(0) || '?'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{opponentData?.username || 'Waiting...'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-primary font-mono">{opponentData?.elo || '---'}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                opponentStatus?.status === "coding" ? "bg-success animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-sm text-muted-foreground">{opponentStatus?.status || "Idle"}</span>
            </div>
          </div>

          {/* Battle Log */}
          <div className="flex-1 p-5 overflow-hidden flex flex-col">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Battle Log</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {events.map((e, i) => (
                <div key={i} className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-2">
                  {e.type === 'BATTLE_START' && "Battle Started!"}
                  {e.type === 'OPPONENT_SUBMITTED' && "Opponent submitted solution"}
                  {e.type === 'JUDGE_RESULT' && "Judge result received"}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
