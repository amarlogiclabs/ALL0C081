
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor } from "@/components/CodeEditor";
import { ArrowLeft, Clock, Trophy, Zap, AlertTriangle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantResult {
    user_id: string;
    username: string;
    avatar?: string;
    score: number;
    test_cases_passed: number;
    test_cases_total: number;
    execution_time_ms: number;
    status: string;
    is_winner?: boolean;
    code_submitted?: string;
    submitted_at?: string;
    submission_count?: number;
    elo_change?: number;
}

export default function BattleResult() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [participants, setParticipants] = useState<ParticipantResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await api.get(`/api/match/room/${roomId}`);
                const data = await res.json();

                if (data.success && data.room) {
                    const parts = data.room.participants || [];
                    // Sort by score/time
                    const sorted = [...parts].sort((a: ParticipantResult, b: ParticipantResult) => {
                        if (b.test_cases_passed !== a.test_cases_passed) {
                            return (b.test_cases_passed || 0) - (a.test_cases_passed || 0);
                        }
                        return (a.execution_time_ms || 999999) - (b.execution_time_ms || 999999);
                    });

                    setParticipants(sorted);
                    if (user && !selectedUser) {
                        setSelectedUser(user.id);
                    } else if (sorted.length > 0 && !selectedUser) {
                        setSelectedUser(sorted[0].user_id);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [roomId, user, selectedUser]);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading Results...</div>;
    }

    const selectedParticipant = participants.find(p => p.user_id === selectedUser);
    const myResult = participants.find(p => p.user_id === user?.id);

    // Determine winner based on DB/ELO result if available, else fallback to local check
    // If elo_change is positive, they likely won or drew well
    const isWinner = myResult?.elo_change && myResult.elo_change > 0;
    const eloDiff = myResult?.elo_change ? (myResult.elo_change > 0 ? `+${myResult.elo_change}` : myResult.elo_change) : null;

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-bold">Battle Results</h1>
                    <div className="w-24" /> {/* Spacer */}
                </div>

                {/* Winner Banner */}
                <Card className={`border-none ${isWinner ? 'bg-yellow-900/20 border-yellow-500/50' : 'bg-secondary/50'}`}>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                        {isWinner ? (
                            <>
                                <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
                                <h2 className="text-4xl font-bold text-yellow-500">Victory!</h2>
                                {eloDiff && <p className="text-xl text-green-400">{eloDiff} ELO Gained</p>}
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold text-muted-foreground">Battle Completed</h2>
                                {myResult && (
                                    <div className="space-y-1">
                                        <p className="text-lg">You placed {participants.indexOf(myResult) + 1}th</p>
                                        {eloDiff && <p className={cn("text-lg", myResult.elo_change && myResult.elo_change < 0 ? "text-red-400" : "text-muted-foreground")}>{eloDiff} ELO</p>}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Submission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                {myResult?.test_cases_passed}/{myResult?.test_cases_total}
                                <span className="text-sm font-normal text-muted-foreground">tests passed</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" />
                                {myResult?.execution_time_ms ? `${myResult.execution_time_ms.toFixed(2)}ms` : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold uppercase text-green-500">
                                {myResult?.status || 'Unknown'}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {myResult?.submission_count || 1}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Time Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Battle Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {myResult?.submitted_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Submitted at:</span>
                                <span className="font-mono">{new Date(myResult.submitted_at).toLocaleTimeString()}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Leaderboard & Code Viewer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                    {/* Leaderboard List */}
                    <Card className="col-span-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Leaderboard</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-0">
                            <div className="divide-y divide-border">
                                {participants.map((p, idx) => (
                                    <div
                                        key={p.user_id}
                                        onClick={() => setSelectedUser(p.user_id)}
                                        className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors ${selectedUser === p.user_id ? 'bg-secondary' : ''}`}
                                    >
                                        <div className="font-mono font-bold text-muted-foreground w-6 text-center">{idx + 1}</div>
                                        <div className="flex-1">
                                            <div className="font-bold">{p.username || 'User'} {p.user_id === user?.id && '(You)'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {p.test_cases_passed}/{p.test_cases_total} tests • {p.execution_time_ms?.toFixed(0)}ms • {p.submission_count || 1} submission{(p.submission_count || 1) > 1 ? 's' : ''}
                                            </div>
                                            {p.submitted_at && (
                                                <div className="text-xs text-muted-foreground/70">
                                                    {new Date(p.submitted_at).toLocaleTimeString()}
                                                </div>
                                            )}
                                        </div>
                                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Code Viewer */}
                    <Card className="col-span-1 lg:col-span-2 flex flex-col overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 py-3">
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">
                                    Viewing: <span className="text-primary">{selectedParticipant?.username || 'Unknown'}</span>
                                </span>
                            </div>
                            {/* Could add language badge here if available in data */}
                        </CardHeader>
                        <div className="flex-1 overflow-hidden relative bg-[#0f1219]">
                            {selectedParticipant?.code_submitted ? (
                                <CodeEditor
                                    value={selectedParticipant.code_submitted}
                                    language="javascript" // TODO: Add language to participant result
                                    readOnly={true}
                                    onChange={() => { }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <div className="text-center">
                                        <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>No code submitted</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
