import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TierBadge, getTierByElo } from "@/components/TierBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Swords,
  Users,
  Clock,
  Loader2,
  X,
  Zap,
  Shield
} from "lucide-react";

import { api } from "@/lib/api";

type MatchmakingState = "idle" | "searching" | "found";

export default function Battles() {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [matchmakingState, setMatchmakingState] = useState<MatchmakingState>("idle");
  const [searchTime, setSearchTime] = useState(0);
  const [countdownTime, setCountdownTime] = useState(3);
  const [opponents, setOpponents] = useState<any[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);

  const startMatchmaking = () => {
    setMatchmakingState("searching");
    setSearchTime(0);

    const interval = setInterval(() => {
      setSearchTime((prev) => prev + 1);
    }, 1000);

    const fetchOpponentsAndMatch = async () => {
      try {
        const response = await api.get('/api/matchmaking/opponents');
        const opponentsData = await response.json();

        let foundOpponent = null;
        if (Array.isArray(opponentsData) && opponentsData.length > 0) {
          // Select a random opponent from the matched list to ensure variety
          const randomIndex = Math.floor(Math.random() * opponentsData.length);
          foundOpponent = opponentsData[randomIndex];
        } else {
          // Robust fallback mock
          foundOpponent = {
            id: 'user_mock_ai_' + Math.floor(Math.random() * 1000),
            username: 'AI_Stratos',
            tier: 'Stellar',
            elo: 1400,
            avatar: 'AS'
          };
        }

        // Add a bit of artificial delay for "searching" feel
        setTimeout(() => {
          clearInterval(interval);
          setMatchmakingState("found");
          setSelectedOpponent(foundOpponent);

          let count = 3;
          const countdownInterval = setInterval(() => {
            count -= 1;
            setCountdownTime(count);

            if (count === 0) {
              clearInterval(countdownInterval);
              createBattle(foundOpponent.id);
            }
          }, 1000);
        }, Math.random() * 2000 + 1000);

      } catch (error) {
        console.error('Error during matchmaking:', error);
        clearInterval(interval);
        setMatchmakingState("idle");
      }
    };

    fetchOpponentsAndMatch();
  };

  const createBattle = async (opponentId: string) => {
    try {
      const response = await api.post('/api/battles', {
        player2_id: opponentId,
        difficulty: userProfile?.tier === 'Bronze' ? 'Easy' : 'Medium'
      });

      const data = await response.json();
      if (data.success) {
        navigate(`/battle/${data.battleId}`);
      } else {
        console.error('Failed to create battle:', data.error);
        setMatchmakingState("idle");
      }
    } catch (error) {
      console.error('Error creating battle:', error);
      setMatchmakingState("idle");
    }
  };

  const cancelMatchmaking = () => {
    setMatchmakingState("idle");
    setSearchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">
                <span className="gradient-text">1v1 Battle Arena</span>
              </h1>
              <p className="text-muted-foreground">
                Find an opponent of similar skill and compete in real-time
              </p>
            </div>

            {/* Matchmaking Card */}
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

                    <h2 className="text-2xl font-bold mb-4">Ready for Battle?</h2>
                    <p className="text-muted-foreground mb-8">
                      You'll be matched with an opponent of similar Elo rating
                    </p>

                    <Button
                      variant="hero"
                      size="xl"
                      onClick={startMatchmaking}
                      className="mb-8"
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
                          {userProfile?.username?.charAt(0) || 'C'}
                        </div>
                        <p className="font-semibold">{userProfile?.username || 'You'}</p>
                        <TierBadge tier={userProfile?.tier || 'Bronze'} size="sm" />
                      </div>

                      <div className="text-3xl font-bold text-muted-foreground">VS</div>

                      {/* Opponent */}
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-tier-stellar to-purple-400 flex items-center justify-center text-2xl font-bold text-white mb-2 mx-auto">
                          {selectedOpponent?.username?.charAt(0) || 'A'}
                        </div>
                        <p className="font-semibold">{selectedOpponent?.username || 'Opponent'}</p>
                        <TierBadge tier={selectedOpponent?.tier || 'Gold'} size="sm" />
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

            {/* Battle Rules */}
            <div className="mt-12 glass-card p-6 rounded-xl text-left">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
