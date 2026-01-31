import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TierBadge, getTierByElo, tiers } from "@/components/TierBadge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  Trophy,
  TrendingUp,
  Flame,
  Calendar,
  Award,
  Target,
  Swords,
  Clock,
  ChevronRight,
  Settings,
  Share2,
  Brain,
  BookOpen,
  Camera,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestResult {
  categoryId: string;
  categoryTitle: string;
  score: number;
  total: number;
  percentage: number;
  date: string;
}

function EloChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  if (data.length === 0) return <div className="h-32 flex items-center justify-center text-muted-foreground">No matches yet</div>;

  return (
    <div className="h-32 flex items-end gap-1">
      {data.map((elo, i) => {
        const height = ((elo - min) / range) * 100;
        return (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t opacity-70 hover:opacity-100 transition-opacity"
            style={{ height: `${Math.max(height, 10)}%` }}
            title={`${elo} Elo`}
          />
        );
      })}
    </div>
  );
}

export default function Profile() {
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [showAllBattles, setShowAllBattles] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shareNotification, setShareNotification] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userBio, setUserBio] = useState("Competitive programmer | Always grinding | GG");
  const [tempBio, setTempBio] = useState(userBio);

  const { user, userProfile } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load test history from localStorage
    const savedTests = localStorage.getItem("aptitudeTestHistory");
    if (savedTests) {
      try {
        const parsed = JSON.parse(savedTests);
        setTestHistory(parsed);
      } catch (e) {
        console.error("Failed to parse test history:", e);
      }
    }

    // Fetch Analytics
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/users/analytics');
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
        }
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile`;
    navigator.clipboard.writeText(profileUrl);
    setShareNotification(true);
    setTimeout(() => setShareNotification(false), 2000);
  };

  const handleSaveSettings = () => {
    setUserBio(tempBio);
    setEditMode(false);
    localStorage.setItem("userBio", tempBio);
  };

  const handleCancelSettings = () => {
    setTempBio(userBio);
    setEditMode(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        // Note: our api wrapper assumes JSON, so we use fetch directly for FormData or update api wrapper.
        // Simplest is generic fetch with token.
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/profile-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          // Reload page or update context (simplest is reload for now or wait for easy refresh)
          window.location.reload();
        } else {
          alert("Upload failed: " + data.error);
        }
      } catch (err) {
        console.error(err);
        alert("Upload failed");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback if no analytics loaded
  const elo = userProfile?.elo || 1000;
  const tier = getTierByElo(elo);
  const winRate = analytics?.stats?.winRate || "0.0";
  const totalMatches = analytics?.stats?.totalMatches || 0;
  const wins = analytics?.stats?.wins || 0;
  const eloHistory = analytics?.eloHistory?.map((x: any) => x.elo) || [elo];
  const recentBattles = analytics?.recentMatches || [];

  const progression = analytics?.progression || {
    nextTier: 'Silver',
    pointsToNext: 200,
    progress: 0
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Bio Section */}
              <div>
                <label className="block text-sm font-semibold mb-3">Profile Bio</label>
                {editMode ? (
                  <div className="space-y-4">
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-secondary/50 border border-gray-700 text-foreground focus:border-primary outline-none transition-colors"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSaveSettings}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleCancelSettings}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground bg-secondary/30 rounded-lg p-4">
                      {userBio}
                    </p>
                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      size="sm"
                    >
                      Edit Bio
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="glass-card p-8 rounded-2xl mb-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden">
                    {userProfile?.avatar?.startsWith('http') ? (
                      <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.username?.[0] || 'U'
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <div className="absolute -bottom-2 -right-2">
                    <TierBadge tier={tier.name} size="md" />
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold mb-1">{userProfile?.username || "Guest"}</h1>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <TierBadge tier={tier.name} size="sm" showLabel />
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined Jan 2025
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 lg:ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="relative"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                  {shareNotification && (
                    <span className="absolute -top-8 right-0 bg-success text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Profile copied!
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group relative">
                <Trophy className="w-5 h-5 text-accent mb-2" />
                <p className="text-2xl font-bold font-mono">{elo}</p>
                <p className="text-sm text-muted-foreground">Current Elo</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group relative">
                <TrendingUp className="w-5 h-5 text-success mb-2" />
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap z-10">
                  {wins} Wins / {totalMatches} Matches
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group relative">
                <Swords className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold">{totalMatches}</p>
                <p className="text-sm text-muted-foreground">Total Battles</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer group relative">
                <Flame className="w-5 h-5 text-tier-cosmic mb-2" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Win Streak</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Elo History */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Elo History</h2>
                </div>
                <EloChart data={eloHistory} />
              </div>

              {/* Battle History */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Battles</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllBattles(!showAllBattles)}
                  >
                    {showAllBattles ? "Show Less" : "View All"} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {(showAllBattles ? recentBattles : recentBattles.slice(0, 3)).map((battle: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            battle.result === "WIN"
                              ? "bg-success/20 text-success"
                              : "bg-destructive/20 text-destructive"
                          )}
                        >
                          <Swords className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {battle.problem_title || 'Battle'}
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-gray-700">
                              {battle.match_type || 'Ranked'}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {battle.result}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "font-mono font-semibold",
                            battle.elo_change > 0 ? "text-success" : "text-destructive"
                          )}
                        >
                          {battle.elo_change > 0 ? "+" : ""}
                          {battle.elo_change}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(battle.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentBattles.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">No recent battles</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Next Tier Progress */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Next Tier
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <TierBadge tier={progression.nextTier} size="lg" showLabel />
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono">
                      {elo} / {elo + progression.pointsToNext}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{
                        width: `${progression.progress}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {progression.pointsToNext} Elo to go
                </p>
              </div>

              {/* Aptitude Test History */}
              {testHistory.length > 0 && (
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-accent" />
                    Test History
                  </h3>
                  <div className="space-y-3">
                    {testHistory.slice(0, 5).map((test, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                      >
                        <div className="flex justify-between mb-1">
                          <p className="font-medium">{test.categoryTitle}</p>
                          <p className="font-semibold text-accent">{test.percentage}%</p>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {test.date}
                          </span>
                          <span className="font-mono">{test.score}/{test.total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-tier-luminary" />
                  Achievements
                </h3>
                <div className="space-y-3">
                  {analytics?.achievements?.map((achievement: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-sm"
                    >
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">{achievement.title}</p>
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{achievement.description}</p>
                      <p className="text-[10px] text-muted-foreground">{achievement.date}</p>
                    </div>
                  ))}
                  {(!analytics?.achievements || analytics.achievements.length === 0) && (
                    <div className="text-sm text-muted-foreground">
                      No achievements yet. Keep competing!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
