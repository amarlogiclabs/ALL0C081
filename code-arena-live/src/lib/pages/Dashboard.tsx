import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TierBadge, getTierByElo } from "@/components/TierBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Swords,
  BookOpen,
  Brain,
  Trophy,
  TrendingUp,
  Target,
  Flame,
  Clock,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";

function StatCard({ icon: Icon, label, value, subValue, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="glass-card p-5 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color || 'from-primary to-accent'} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {subValue && (
          <span className="text-xs text-muted-foreground">{subValue}</span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href, gradient }: {
  icon: React.ElementType;
  label: string;
  href: string;
  gradient: string;
}) {
  return (
    <Link to={href}>
      <div className="glass-card-hover p-6 rounded-xl text-center group cursor-pointer">
        <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="font-semibold">{label}</p>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { userProfile, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  // Use real user data with fallback defaults
  const elo = userProfile.elo || 1000;
  const tier = getTierByElo(elo);
  const totalMatches = userProfile.total_matches || 0;
  const wins = userProfile.wins || 0;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0.0";

  // Calculate ELO needed for next tier
  const tierThresholds = [
    { name: 'Universal', min: 2400 },
    { name: 'Celestia', min: 2000 },
    { name: 'Galactic', min: 1800 },
    { name: 'Cosmic', min: 1600 },
    { name: 'Luminary', min: 1400 },
    { name: 'Stellar', min: 1200 },
    { name: 'Nova', min: 1000 },
    { name: 'Nebula', min: 0 }
  ];

  let eloToNextTier = 0;
  for (let i = 0; i < tierThresholds.length - 1; i++) {
    if (elo < tierThresholds[i].min) {
      eloToNextTier = tierThresholds[i].min - elo;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="glass-card p-6 sm:p-8 rounded-2xl mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg overflow-hidden">
                  {userProfile.avatar?.startsWith('http') ? (
                    <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    userProfile.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <TierBadge tier={tier.name} size="sm" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{userProfile.username}</h1>
                  <TierBadge tier={tier.name} size="md" showLabel />
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-accent" />
                    <span className="font-mono font-semibold text-foreground">{elo}</span> Elo
                  </span>
                  <span>•</span>
                  <span>{tier.level}</span>
                </div>
              </div>

              {/* Quick Battle */}
              <Link to="/compete">
                <Button variant="hero" size="lg" className="group">
                  <Swords className="w-5 h-5" />
                  Find Battle
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Swords}
              label="Total Battles"
              value={totalMatches}
              color="from-primary to-pink-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Win Rate"
              value={`${winRate}%`}
              subValue={`${wins}W / ${losses}L`}
              color="from-success to-emerald-400"
            />
            <StatCard
              icon={Flame}
              label="Wins"
              value={wins}
              color="from-tier-cosmic to-red-400"
            />
            <StatCard
              icon={Target}
              label="Next Tier"
              value={eloToNextTier > 0 ? eloToNextTier : 'Max!'}
              subValue={eloToNextTier > 0 ? "Elo needed" : ""}
              color="from-tier-luminary to-amber-400"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction
                icon={Swords}
                label="Start Battle"
                href="/compete"
                gradient="from-primary to-pink-500"
              />
              <QuickAction
                icon={BookOpen}
                label="Practice"
                href="/practice"
                gradient="from-accent to-cyan-400"
              />
              <QuickAction
                icon={Brain}
                label="Aptitude Test"
                href="/aptitude"
                gradient="from-tier-stellar to-purple-400"
              />
              <QuickAction
                icon={Trophy}
                label="Leaderboard"
                href="/leaderboard"
                gradient="from-tier-luminary to-amber-400"
              />
            </div>
          </div>

          {/* Recent Activity - Empty State for new users */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {totalMatches === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No battles yet!</p>
                <p className="text-sm">Start your first battle to see your activity here.</p>
                <Link to="/compete">
                  <Button variant="default" className="mt-4">
                    <Swords className="w-4 h-4 mr-2" />
                    Find Your First Battle
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4 text-muted-foreground">
                  <p>Battle history will be shown here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

