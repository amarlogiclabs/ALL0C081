import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { TierBadge, getTierByElo } from "@/components/TierBadge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Swords,
  Users,
  Clock,
  Loader2,
  X,
  Zap,
  Shield,
  Plus,
  LogIn,
  Code,
  Trophy,
  Mail,
  User as UserIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MatchmakingState = "idle" | "searching" | "found";
type TabType = "battles" | "friendly";

export default function Compete() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Battles state
  const [matchmakingState, setMatchmakingState] = useState<MatchmakingState>("idle");
  const [searchTime, setSearchTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(3);
  const [opponents, setOpponents] = useState<any[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);

  // Friendly match state
  const [roomCode, setRoomCode] = useState("");
  const [selectedMode, setSelectedMode] = useState<"1v1" | "2v2">("1v1");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [selectedLevel, setSelectedLevel] = useState("medium");
  const [selectedTiming, setSelectedTiming] = useState("30");
  const [inviteType, setInviteType] = useState<"userId" | "email">("userId");
  const [inviteValue, setInviteValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("battles");

  const getAuthToken = () => {
    return localStorage.getItem("auth_token") || localStorage.getItem("token") || "";
  };

  // Battles functions
  const startMatchmaking = () => {
    setMatchmakingState("searching");
    setSearchTime(0);

    const interval = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    const fetchOpponents = async () => {
      try {
        const mockOpponents = [
          { id: "bot_1", username: "CodeMaster", tier: "Platinum", elo: 1650, avatar: "CM" },
          { id: "bot_2", username: "ByteNinja", tier: "Gold", elo: 1523, avatar: "BN" },
          { id: "bot_3", username: "AlgoExpert", tier: "Gold", elo: 1480, avatar: "AE" },
        ];
        setOpponents(mockOpponents);
      } catch (error) {
        console.error("Error fetching opponents:", error);
      }
    };

    fetchOpponents();

    setTimeout(() => {
      clearInterval(interval);
      setMatchmakingState("found");

      if (opponents.length > 0) {
        const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
        setSelectedOpponent(randomOpponent);
      } else {
        setSelectedOpponent({
          username: "ByteNinja",
          tier: "Gold",
          elo: 1523,
          avatar: "BN",
        });
      }

      let count = 3;
      const countdownInterval = setInterval(() => {
        count -= 1;
        setCountdownTime(count);

        if (count === 0) {
          clearInterval(countdownInterval);
          createBattle();
        }
      }, 1000);
    }, Math.random() * 5000 + 3000);
  };

  const createBattle = async () => {
    try {
      // Call backend to find random match
      const response = await api.post("/api/match/room/random", {});
      const data = await response.json();

      if (data.success && data.roomId) {
        navigate(`/battle/${data.roomId}`);
      } else {
        console.error("Failed to find match:", data.error);
      }
    } catch (error) {
      console.error("Error creating battle:", error);
    }
  };

  const cancelMatchmaking = () => {
    setMatchmakingState("idle");
    setSearchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Friendly match functions
  const handleCreateRoom = async () => {
    try {
      setIsCreating(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to create a room");
        navigate("/login");
        return;
      }

      const response = await api("/api/match/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchType: selectedMode,
          problemId: null,
          language: selectedLanguage,
          level: selectedLevel,
          timing: parseInt(selectedTiming),
          invites: inviteValue ? [{ type: inviteType, value: inviteValue }] : [],
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        // If not JSON, show a generic error
        setError("Server error: Unexpected response. Please try again later.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to create room");
        return;
      }

      navigate(`/match/${data.roomId}`, { state: { isHost: true } });
      setCreateOpen(false);
      setError("");
      setInviteValue("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    try {
      setIsJoining(true);
      setError("");

      if (!/^\d{4}$/.test(roomCode)) {
        setError("Room code must be 4 digits");
        setIsJoining(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setError("You must be logged in to join a room");
        navigate("/login");
        return;
      }

      const response = await api("/api/match/room/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomCode }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        setError("Server error: Unexpected response. Please try again later.");
        return;
      }

      if (!response.ok) {
        setError(data.error || "Failed to join room");
        return;
      }

      navigate(`/match/${data.roomId}`, { state: { isHost: false } });
      setJoinOpen(false);
      setRoomCode("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="w-full text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Compete & Challenge</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Test your coding skills against random opponents or challenge your friends
            </p>
          </div>

          {/* Tabs */}
          <div className="w-full flex justify-center mb-8">
            <div className="inline-flex gap-4 border-b border-border pb-4">
              <button
                onClick={() => setActiveTab("battles")}
                className={`px-6 py-2 font-semibold transition-colors ${activeTab === "battles"
                  ? "text-primary border-b-2 border-primary -mb-[18px]"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  Random Battles
                </div>
              </button>
              <button
                onClick={() => setActiveTab("friendly")}
                className={`px-6 py-2 font-semibold transition-colors ${activeTab === "friendly"
                  ? "text-primary border-b-2 border-primary -mb-[18px]"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Friendly Matches
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content - Centered */}
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              {/* Battles Section */}
              {activeTab === "battles" && (
                <div className="glass-card p-8 sm:p-12 rounded-2xl relative overflow-hidden">
                  {/* Background Effects */}
                  {matchmakingState === "searching" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 animate-pulse" />
                  )}
                  {matchmakingState === "found" && (
                    <div className="absolute inset-0 bg-success/10" />
                  )}

                  <div className="relative z-10">
                    {matchmakingState === "idle" && (
                      <>
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                          <Swords className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold mb-4 text-center">Ready for Battle?</h2>
                        <p className="text-muted-foreground mb-8 text-center">
                          You'll be matched with an opponent of similar Elo rating
                        </p>

                        <Button
                          variant="hero"
                          size="xl"
                          onClick={startMatchmaking}
                          className="mb-8 mx-auto flex items-center justify-center"
                        >
                          <Swords className="w-5 h-5" />
                          Find Match
                        </Button>

                        {/* Stats */}
                        <div className="flex justify-center gap-8 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            <span>1,247 online</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-accent" />
                            <span>~30s avg wait</span>
                          </div>
                        </div>
                      </>
                    )}

                    {matchmakingState === "searching" && (
                      <>
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg animate-glow relative">
                          <Loader2 className="w-12 h-12 text-white animate-spin" />
                          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Finding Opponent...</h2>
                        <p className="text-4xl font-mono font-bold text-accent mb-4">
                          {formatTime(searchTime)}
                        </p>
                        <p className="text-muted-foreground mb-8">
                          Searching for players in your Elo range
                        </p>

                        <Button
                          variant="outline"
                          size="lg"
                          onClick={cancelMatchmaking}
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </>
                    )}

                    {matchmakingState === "found" && (
                      <>
                        <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-success flex items-center justify-center shadow-lg animate-scale-in">
                          <Zap className="w-12 h-12 text-white" />
                        </div>

                        <h2 className="text-2xl font-bold mb-6 text-success">Match Found!</h2>

                        {/* VS Display */}
                        <div className="flex items-center justify-center gap-8 mb-8">
                          {/* You */}
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white mb-2 mx-auto">
                              {userProfile?.username?.charAt(0) || "C"}
                            </div>
                            <p className="font-semibold">{userProfile?.username || "You"}</p>
                            <TierBadge tier={userProfile?.tier as any || "Bronze"} size="sm" />
                          </div>

                          <div className="text-3xl font-bold text-muted-foreground">VS</div>

                          {/* Opponent */}
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-tier-stellar to-purple-400 flex items-center justify-center text-2xl font-bold text-white mb-2 mx-auto">
                              {selectedOpponent?.username?.charAt(0) || "A"}
                            </div>
                            <p className="font-semibold">{selectedOpponent?.username || "Opponent"}</p>
                            <TierBadge tier={selectedOpponent?.tier || "Gold"} size="sm" />
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6">
                          Battle starting in {countdownTime} seconds...
                        </p>

                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4" />
                          <span>Secure battle environment ready</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Friendly Match Section */}
              {activeTab === "friendly" && (
                <>
                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <Card className="bg-card p-6 text-center hover:border-primary/50 transition">
                      <Zap className="w-12 h-12 mx-auto mb-3 text-accent" />
                      <h3 className="font-semibold mb-2">Real-Time</h3>
                      <p className="text-sm text-muted-foreground">
                        Live updates and instant feedback
                      </p>
                    </Card>

                    <Card className="bg-card p-6 text-center hover:border-primary/50 transition">
                      <Code className="w-12 h-12 mx-auto mb-3 text-accent" />
                      <h3 className="font-semibold mb-2">Customizable</h3>
                      <p className="text-sm text-muted-foreground">
                        Set language, level, and time limits
                      </p>
                    </Card>
                  </div>

                  {/* Main Action Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Create Room Card */}
                    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                      <Card className="bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30 p-8 cursor-pointer hover:border-primary/50 transition">
                        <DialogTrigger asChild>
                          <div className="text-center">
                            <Plus className="w-16 h-16 mx-auto mb-4 text-primary" />
                            <h2 className="text-2xl font-bold mb-2">Create Room</h2>
                            <p className="text-muted-foreground mb-4">
                              Start a new match and invite your friends
                            </p>
                            <Button variant="default">Create Room</Button>
                          </div>
                        </DialogTrigger>
                      </Card>

                      <DialogContent className="bg-background border-border max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New Room</DialogTitle>
                          <DialogDescription>
                            Customize your match settings and invite friends
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          {/* Mode Selection */}
                          <div>
                            <label className="text-sm font-semibold mb-3 block">Match Type</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setSelectedMode("1v1")}
                                className={`p-4 rounded-lg border transition ${selectedMode === "1v1"
                                  ? "bg-primary border-primary"
                                  : "bg-secondary border-border hover:border-primary/50"
                                  }`}
                              >
                                <Users className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-semibold text-sm">1v1</div>
                                <div className="text-xs text-muted-foreground">One on One</div>
                              </button>
                              <button
                                onClick={() => setSelectedMode("2v2")}
                                className={`p-4 rounded-lg border transition ${selectedMode === "2v2"
                                  ? "bg-primary border-primary"
                                  : "bg-secondary border-border hover:border-primary/50"
                                  }`}
                              >
                                <Users className="w-6 h-6 mx-auto mb-2" />
                                <div className="font-semibold text-sm">2v2</div>
                                <div className="text-xs text-muted-foreground">Team Battle</div>
                              </button>
                            </div>
                          </div>

                          {/* Language Selection */}
                          <div>
                            <label className="text-sm font-semibold mb-2 block">Programming Language</label>
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-secondary border-border">
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="csharp">C#</SelectItem>
                                <SelectItem value="go">Go</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Level Selection */}
                          <div>
                            <label className="text-sm font-semibold mb-2 block">Problem Level</label>
                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-secondary border-border">
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Timing Selection */}
                          <div>
                            <label className="text-sm font-semibold mb-2 block">Time Limit (minutes)</label>
                            <Select value={selectedTiming} onValueChange={setSelectedTiming}>
                              <SelectTrigger className="bg-secondary border-border">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-secondary border-border">
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Invite */}
                          <div>
                            <label className="text-sm font-semibold mb-2 block">Invite Friend (Optional)</label>
                            <div className="flex gap-2 mb-2">
                              <button
                                onClick={() => setInviteType("userId")}
                                className={`flex-1 py-2 px-3 rounded-md border text-sm flex items-center justify-center gap-2 transition ${inviteType === "userId"
                                  ? "bg-primary border-primary"
                                  : "bg-secondary border-border hover:border-primary/50"
                                  }`}
                              >
                                <UserIcon className="w-4 h-4" />
                                By ID
                              </button>
                              <button
                                onClick={() => setInviteType("email")}
                                className={`flex-1 py-2 px-3 rounded-md border text-sm flex items-center justify-center gap-2 transition ${inviteType === "email"
                                  ? "bg-primary border-primary"
                                  : "bg-secondary border-border hover:border-primary/50"
                                  }`}
                              >
                                <Mail className="w-4 h-4" />
                                By Email
                              </button>
                            </div>
                            <Input
                              placeholder={inviteType === "userId" ? "Enter user ID" : "Enter email address"}
                              value={inviteValue}
                              onChange={(e) => setInviteValue(e.target.value)}
                              className="bg-secondary border-border"
                            />
                          </div>

                          {error && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm">
                              {error}
                            </div>
                          )}

                          <Button
                            onClick={handleCreateRoom}
                            disabled={isCreating}
                            className="w-full"
                            variant="default"
                          >
                            {isCreating ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating Room...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Room
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Join Room Card */}
                    <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
                      <Card className="bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30 p-8 cursor-pointer hover:border-accent/50 transition">
                        <DialogTrigger asChild>
                          <div className="text-center">
                            <LogIn className="w-16 h-16 mx-auto mb-4 text-accent" />
                            <h2 className="text-2xl font-bold mb-2">Join Room</h2>
                            <p className="text-muted-foreground mb-4">
                              Enter a 4-digit code to join your friend's room
                            </p>
                            <Button variant="default">Join Room</Button>
                          </div>
                        </DialogTrigger>
                      </Card>

                      <DialogContent className="bg-background border-border max-w-md">
                        <DialogHeader>
                          <DialogTitle>Join Room</DialogTitle>
                          <DialogDescription>
                            Ask your friend for the 4-digit room code
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          <div>
                            <label className="text-sm font-semibold mb-2 block">Room Code</label>
                            <Input
                              placeholder="0000"
                              maxLength={4}
                              value={roomCode}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                setRoomCode(val);
                              }}
                              className="bg-secondary border-border text-center text-2xl font-mono tracking-widest"
                            />
                          </div>

                          {error && (
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm">
                              {error}
                            </div>
                          )}

                          <Button
                            onClick={handleJoinRoom}
                            disabled={isJoining || roomCode.length !== 4}
                            className="w-full"
                            variant="default"
                          >
                            {isJoining ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              <>
                                <LogIn className="w-4 h-4 mr-2" />
                                Join Room
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Info Section */}
                  <Card className="bg-card p-8 mb-8">
                    <h3 className="text-xl font-bold mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold mr-3 text-primary-foreground">
                            1
                          </div>
                          <h4 className="font-semibold">Customize Match</h4>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          Set language, level, and time limit for the match
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold mr-3 text-primary-foreground">
                            2
                          </div>
                          <h4 className="font-semibold">Invite Friends</h4>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          Invite by user ID or email, or share the room code
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold mr-3 text-primary-foreground">
                            3
                          </div>
                          <h4 className="font-semibold">Code & Compete</h4>
                        </div>
                        <p className="text-sm text-muted-foreground ml-11">
                          Code together and see the live leaderboard
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Rules Section */}
                  <Card className="bg-card p-8">
                    <h3 className="text-xl font-bold mb-4">Match Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">1v1 Mode</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Exactly 2 participants required</li>
                          <li>Same problem for both players</li>
                          <li>Real-time code execution</li>
                          <li>Leaderboard based on speed</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">2v2 Mode</h4>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Exactly 4 participants required</li>
                          <li>Two equal teams</li>
                          <li>Same problem for all</li>
                          <li>Team-based leaderboard</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </div>
          </div>

          {/* Battle Rules (shown only in battles tab) */}
          {activeTab === "battles" && (
            <div className="flex justify-center mt-12">
              <div className="w-full max-w-4xl glass-card p-6 rounded-xl text-left">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Battle Rules
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Both players receive the same problem</li>
                  <li>• 20 minute time limit per battle</li>
                  <li>• First correct submission (AC) wins</li>
                  <li>• Elo points awarded based on result and opponent rating</li>
                  <li>• Disconnection counts as a loss after 60 seconds</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
