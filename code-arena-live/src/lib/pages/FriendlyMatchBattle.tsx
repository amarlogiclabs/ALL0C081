import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CodeEditor, Language, getDefaultCode } from "@/components/CodeEditor";
import {
    CheckCircle2,
    Play,
    Send,
    Loader2,
    X,
    Settings,
    Clock,
    Radio,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock Data (Fallback if problem fetch fails)
const mockProblem = {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    acceptance: "49.2%",
    description: "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.",
    examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] == 9, so we return [0, 1]" },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "nums[1] + nums[2] == 6, so we return [1, 2]" }
    ],
    constraints: "2 <= nums.length <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9"
};

export default function FriendlyMatchBattle() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State
    const [roomState, setRoomState] = useState<any>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>("python");
    const [code, setCode] = useState(getDefaultCode("python"));
    const [isRunning, setIsRunning] = useState(false);
    const [consoleOutput, setConsoleOutput] = useState("");
    const [testResults, setTestResults] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [isLoadingRoom, setIsLoadingRoom] = useState(true);
    const [compilerInfo, setCompilerInfo] = useState<any>(null);
    const [showExitDialog, setShowExitDialog] = useState(false);

    // Derived User IDs
    const userId = user ? user.id : (localStorage.getItem('userId') || '0');

    // Fetch Compiler Info
    useEffect(() => {
        const fetchCompilerInfo = async () => {
            try {
                const response = await api.get('/api/compiler/info');
                if (response.ok) {
                    const data = await response.json();
                    setCompilerInfo(data);
                }
            } catch (error) {
                console.error("Failed to fetch compiler info:", error);
            }
        };
        fetchCompilerInfo();
    }, []);

    // Fetch Room State
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const response = await api.get(`/api/match/room/${roomId}`);
                if (response.ok) {
                    const data = await response.json();
                    setRoomState(data.room);

                    // Check if battle is completed
                    if (data.room?.status === 'completed') {
                        navigate(`/battle/results/${roomId}`);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch room:", error);
            } finally {
                setIsLoadingRoom(false);
            }
        };

        if (roomId) {
            fetchRoomData();
            // Poll for updates (simplified for now, ideally use WS)
            const interval = setInterval(fetchRoomData, 5000);
            return () => clearInterval(interval);
        }
    }, [roomId, navigate]);

    // Timer countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    // Navigate to results when timer expires
                    setTimeout(() => {
                        navigate(`/battle/results/${roomId}`);
                    }, 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [roomId, navigate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleLanguageChange = (newLang: Language) => {
        setSelectedLanguage(newLang);
        setCode(getDefaultCode(newLang));
    };

    const handleRun = async () => {
        setIsRunning(true);
        setConsoleOutput("Running code...\n");
        try {
            const response = await api.post('/api/compiler/run', {
                code,
                language: selectedLanguage,
                input: ''
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Execution failed');

            const output = data.stdout || data.stderr || data.compile_output || data.message;
            setConsoleOutput(output);
        } catch (error) {
            setConsoleOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // ... (Submit logic)
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            api.post(`/api/match/room/${roomId}/submit`, { code, language: selectedLanguage })
                .catch(e => console.error(e));
        }, 1000);
    };

    const handleLeave = () => {
        setShowExitDialog(true);
    };

    const confirmLeave = () => {
        // Navigate to results page instead of compete page
        navigate(`/battle/results/${roomId}`);
    };

    if (isLoadingRoom) {
        return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Battle...</div>;
    }

    // Identify Participants
    const myParticipant = roomState?.participants?.find((p: any) => p.user_id === userId);
    const opponent = roomState?.participants?.find((p: any) => p.user_id !== userId);

    // Extract problem data from roomState or use mock
    const problem = roomState ? {
        id: roomState.problem_id,
        title: roomState.title || mockProblem.title,
        description: roomState.description || mockProblem.description,
        difficulty: roomState.difficulty || mockProblem.difficulty,
        topic: roomState.topic || mockProblem.topic,
        examples: roomState.examples || mockProblem.examples,
        constraints: roomState.constraints || mockProblem.constraints
    } : mockProblem;

    return (
        <div className="flex flex-col h-screen bg-black overflow-hidden">
            {/* Header */}
            <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-blue-500 animate-pulse" />
                    <h2 className="text-lg font-bold text-white">Live Battle</h2>
                    <span className="text-gray-500 text-sm">Problem: {problem.title || "Loading..."}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-lg font-mono font-bold text-orange-500">{formatTime(timeLeft)}</span>
                    <button onClick={handleLeave}><X className="w-6 h-6 text-gray-400" /></button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden gap-0">
                {/* Left: Problem */}
                <div className="w-1/4 border-r border-gray-800 overflow-y-auto p-6 space-y-6 bg-gray-950">
                    {/* Difficulty Badge */}
                    <div className="inline-block">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold uppercase",
                            problem.difficulty === "Easy" && "bg-green-900/50 text-green-400 border border-green-700",
                            problem.difficulty === "Medium" && "bg-yellow-900/50 text-yellow-400 border border-yellow-700",
                            problem.difficulty === "Hard" && "bg-red-900/50 text-red-400 border border-red-700"
                        )}>
                            {problem.difficulty || "Easy"}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white">{problem.title || "Loading..."}</h3>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed">{problem.description}</p>

                    {/* Examples */}
                    {problem.examples && problem.examples.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Examples</h4>
                            {problem.examples.map((example: any, idx: number) => (
                                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
                                    <div className="font-mono text-xs">
                                        <div><span className="text-gray-500">Input:</span> <span className="text-blue-400">{example.input}</span></div>
                                        <div><span className="text-gray-500">Output:</span> <span className="text-green-400">{example.output}</span></div>
                                    </div>
                                    {example.explanation && (
                                        <div className="text-xs text-gray-400 pt-2 border-t border-gray-800">
                                            {example.explanation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Constraints */}
                    {problem.constraints && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Constraints</h4>
                            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                                <p className="text-gray-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                                    {problem.constraints}
                                </p>
                            </div>
                        </div>
                    )}
                </div>


                {/* Middle: Code */}
                <div className="flex-1 flex flex-col border-r border-gray-800 bg-gray-900 min-w-0">
                    {/* Editor Toolbar */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950">
                        <div className="flex items-center gap-3">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                                className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm border border-gray-700 focus:border-blue-500 outline-none"
                            >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="java">Java</option>
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                            </select>
                            {compilerInfo?.compilers?.[selectedLanguage] && (
                                <span className={cn(
                                    "text-xs px-2 py-1 rounded-full",
                                    compilerInfo.compilers[selectedLanguage].available
                                        ? "bg-green-900/50 text-green-400 border border-green-700"
                                        : "bg-red-900/50 text-red-400 border border-red-700"
                                )}>
                                    {compilerInfo.compilers[selectedLanguage].version}
                                    {compilerInfo.useLocal && compilerInfo.compilers[selectedLanguage].available && " • Local"}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-500" />
                        </div>
                    </div>
                    {/* Editor */}
                    <div className="flex-1 overflow-hidden border-b border-gray-800">
                        <CodeEditor value={code} onChange={setCode} language={selectedLanguage} />
                    </div>
                    {/* Buttons */}
                    <div className="p-3 flex items-center gap-3">
                        <Button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2">
                            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            Run
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} variant="default" className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit
                        </Button>
                    </div>
                    {/* Console Output */}
                    {consoleOutput && (
                        <div className="border-t border-gray-800 bg-gray-950 p-3 max-h-32 overflow-y-auto">
                            <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">{consoleOutput}</pre>
                        </div>
                    )}
                </div>

                {/* Right: Players */}
                <div className="w-80 border-l border-gray-800 bg-gray-950 flex flex-col overflow-hidden">
                    {/* Me */}
                    <div className="p-4 border-b border-gray-800">
                        <div className="text-xs text-gray-500 uppercase mb-1">You</div>
                        <div className="text-lg font-bold text-white">{myParticipant?.username || "You"}</div>
                        <div className="text-sm text-green-400">Ready</div>
                    </div>

                    {/* Opponent */}
                    <div className="p-4 border-b border-gray-800">
                        <div className="text-xs text-gray-500 uppercase mb-1">Opponent</div>
                        {opponent ? (
                            <>
                                <div className="text-lg font-bold text-white">{opponent.username || `User ${opponent.user_id.slice(0, 6)}`}</div>
                                <div className="text-sm text-yellow-400">{opponent.status}</div>
                            </>
                        ) : (
                            <div className="text-gray-500 italic">Waiting for opponent...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Exit Confirmation Dialog */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>View Battle Results?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will end your battle session and take you to the results page where you can view scores and spectate other participants' code.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Stay in Battle</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLeave} className="bg-blue-600 hover:bg-blue-700">
                            View Results
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
