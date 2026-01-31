import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, Circle, Loader2, Send, Trophy, Users, Clock, Play } from 'lucide-react';

interface Participant {
  user_id: number;
  team_number?: number;
  status: 'joined' | 'ready' | 'coding' | 'submitted' | 'completed';
  score?: number;
  test_cases_passed?: number;
  test_cases_total?: number;
}

interface RoomState {
  id: string;
  room_code: string;
  match_type: '1v1' | '2v2';
  status: string;
  participants: Participant[];
  problem_id?: number;
}

const DEFAULT_CODE = `// Write your solution here
function solve(problem) {
  // Your code here
  return result;
}`;

export default function MatchSession() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const userId = parseInt(localStorage.getItem('userId') || '0');
  const userToken = localStorage.getItem('auth_token') || localStorage.getItem('token');

  // Timer
  useEffect(() => {
    if (roomState?.status === 'in_progress') {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomState]);

  // Fetch room state
  useEffect(() => {
    const fetchRoomState = async () => {
      try {
        const response = await api.get(`/api/match/room/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const newRoomState = data.room;
          setRoomState(newRoomState);

          // Navigate to battle results when match is completed
          if (newRoomState.status === 'completed') {
            navigate(`/battle/results/${roomId}`);
          }
        }
      } catch (err) {
        console.error('Error fetching room state:', err);
      }
    };

    if (roomId && userToken) {
      fetchRoomState();
      const interval = setInterval(fetchRoomState, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId, userToken, navigate]);

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get(`/api/match/room/${roomId}/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };

    if (roomId && userToken && roomState?.status === 'in_progress') {
      fetchLeaderboard();
      const interval = setInterval(fetchLeaderboard, 3000);
      return () => clearInterval(interval);
    }
  }, [roomId, userToken, roomState]);

  // Handle run code
  const handleRun = async () => {
    try {
      setIsRunning(true);
      setConsoleOutput('Running tests...\n');
      setError('');

      const response = await api.post(`/api/match/room/${roomId}/run`, {
        code,
        language: selectedLanguage
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to run code');
      }

      const data = await response.json();
      const result = data.result;

      // Format output based on test results
      let output = '';

      if (result.verdict === 'COMPILATION_ERROR') {
        output = `❌ Compilation Error:\n${result.error}\n`;
      } else if (result.verdict === 'RUNTIME_ERROR') {
        output = `❌ Runtime Error:\n${result.error}\n`;
      } else if (result.testResults && result.testResults.length > 0) {
        output = 'Test Results:\n\n';
        result.testResults.forEach((tr: any) => {
          if (tr.passed) {
            output += `✓ Test case ${tr.testCase} passed (${tr.time || 0}ms)\n`;
          } else {
            output += `✗ Test case ${tr.testCase} failed\n`;
            if (tr.error) {
              output += `  Error: ${tr.error}\n`;
            } else {
              output += `  Expected: ${tr.expected}\n  Got: ${tr.actual}\n`;
            }
          }
        });

        output += `\n${result.testCasesPassed}/${result.testCasesTotal} tests passed`;

        if (result.testCasesPassed === result.testCasesTotal) {
          output += '\n\n✓ All tests passed!';
        }
      } else {
        output = `${result.verdict}\n${result.testCasesPassed}/${result.testCasesTotal} tests passed`;
      }

      setConsoleOutput(output);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setConsoleOutput(`❌ Error: ${errorMsg}`);
      setError(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  // Handle submit code
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      setConsoleOutput('Submitting solution...\n');

      const response = await api.post(`/api/match/room/${roomId}/submit`, {
        code,
        language: selectedLanguage
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit');
      }

      const data = await response.json();
      const result = data.result;

      // Format submission result
      let output = '';

      if (result.verdict === 'ACCEPTED') {
        output = '✓ Solution accepted! All test cases passed.\n\n';
        output += `Tests: ${result.testCasesPassed}/${result.testCasesTotal}\n`;
        output += `Execution time: ${result.executionTime?.toFixed(2) || 0}ms\n\n`;
        output += 'Your solution has been submitted. Waiting for opponent...';
      } else if (result.verdict === 'COMPILATION_ERROR') {
        output = `❌ Compilation Error:\n${result.error}`;
      } else if (result.verdict === 'RUNTIME_ERROR') {
        output = `❌ Runtime Error:\n${result.error}`;
      } else if (result.verdict === 'WRONG_ANSWER') {
        output = `❌ Wrong Answer\n\n`;
        output += `Tests passed: ${result.testCasesPassed}/${result.testCasesTotal}\n`;
        if (result.testResults && result.testResults.length > 0) {
          const failed = result.testResults.find((tr: any) => !tr.passed);
          if (failed) {
            output += `\nFirst failed test:\n`;
            output += `  Expected: ${failed.expected}\n`;
            output += `  Got: ${failed.actual}\n`;
          }
        }
      } else {
        output = `${result.verdict}\n${result.testCasesPassed}/${result.testCasesTotal} tests passed`;
      }

      setConsoleOutput(output);
      setSubmitted(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit';
      setError(errorMsg);
      setConsoleOutput(`❌ Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!roomState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Coding Match in Progress</h1>
              <p className="text-slate-400 text-sm">Room: {roomState.room_code}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
              </div>
              <Button
                onClick={() => navigate(`/match/${roomId}`)}
                variant="outline"
                className="border-slate-600"
              >
                Exit
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Main Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            {/* Problem Description - Left */}
            <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700 p-4 overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Problem</h2>
              <div className="space-y-4 text-sm text-slate-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">Problem Statement</h3>
                  <p>
                    Given an array of integers, write a function to find two numbers that add up to a specific target.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Examples</h3>
                  <div className="bg-slate-700/50 p-3 rounded font-mono text-xs">
                    <p>Input: nums = [2,7,11,15], target = 9</p>
                    <p>Output: [0, 1]</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-white mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>1 ≤ nums.length ≤ 10⁴</li>
                    <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Code Editor - Center */}
            <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-700">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage} disabled={submitted}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                    <SelectItem value="rust">Rust</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={submitted}
                className="flex-1 p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none disabled:opacity-50"
                placeholder="Write your code here..."
              />

              <div className="p-4 border-t border-slate-700 flex gap-2">
                <Button
                  onClick={handleRun}
                  disabled={isRunning || submitted}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || submitted}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Right Sidebar - Console & Leaderboard */}
            <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
              {/* Console Output */}
              <Card className="bg-slate-800/50 border-slate-700 p-4 overflow-hidden flex flex-col">
                <h3 className="font-bold mb-2">Console</h3>
                <pre className="flex-1 bg-slate-900 p-3 rounded text-xs font-mono text-slate-300 overflow-y-auto whitespace-pre-wrap break-words">
                  {consoleOutput || 'Output will appear here...'}
                </pre>
              </Card>

              {/* Leaderboard */}
              <Card className="bg-slate-800/50 border-slate-700 p-4 overflow-hidden flex flex-col">
                <h3 className="font-bold mb-3 flex items-center">
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </h3>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {roomState.participants.map((p, idx) => (
                    <div key={p.user_id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span>
                          {p.user_id === userId ? 'You' : (p as any).username || `Player ${p.user_id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(p as any).elo && (
                          <span className="text-xs text-amber-400 font-mono mr-2">{(p as any).elo}</span>
                        )}
                        <Badge
                          variant={p.status === 'submitted' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {p.status === 'submitted' ? '✓ Solved' : p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
