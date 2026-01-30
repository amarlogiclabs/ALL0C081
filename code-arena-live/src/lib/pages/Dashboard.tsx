import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TierBadge, getTierByElo } from "@/components/TierBadge";
import { 
  Swords, 
  BookOpen, 
  Brain, 
  Trophy,
  TrendingUp,
  Target,
  Flame,
  Clock,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock user data
const mockUser = {
  username: "CosmicCoder42",
  elo: 1456,
  battles: 127,
  wins: 78,
  losses: 49,
  streak: 5,
  recentActivity: [
    { type: "battle", result: "win", opponent: "ByteNinja", eloChange: +18, time: "2 hours ago" },
    { type: "battle", result: "loss", opponent: "AlgoMaster", eloChange: -12, time: "5 hours ago" },
    { type: "practice", problem: "Two Sum", difficulty: "Easy", time: "Yesterday" },
    { type: "battle", result: "win", opponent: "CodeWarrior", eloChange: +15, time: "Yesterday" },
  ],
};

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
  const tier = getTierByElo(mockUser.elo);
  const winRate = ((mockUser.wins / mockUser.battles) * 100).toFixed(1);

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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {mockUser.username[0]}
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <TierBadge tier={tier.name} size="sm" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{mockUser.username}</h1>
                  <TierBadge tier={tier.name} size="md" showLabel />
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-accent" />
                    <span className="font-mono font-semibold text-foreground">{mockUser.elo}</span> Elo
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
              value={mockUser.battles}
              color="from-primary to-pink-500"
            />
            <StatCard 
              icon={TrendingUp} 
              label="Win Rate" 
              value={`${winRate}%`}
              subValue={`${mockUser.wins}W / ${mockUser.losses}L`}
              color="from-success to-emerald-400"
            />
            <StatCard 
              icon={Flame} 
              label="Win Streak" 
              value={mockUser.streak}
              color="from-tier-cosmic to-red-400"
            />
            <StatCard 
              icon={Target} 
              label="Next Tier" 
              value={`${1700 - mockUser.elo}`}
              subValue="Elo needed"
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

          {/* Recent Activity */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {mockUser.recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'battle' 
                      ? activity.result === 'win' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-destructive/20 text-destructive'
                      : 'bg-accent/20 text-accent'
                  }`}>
                    {activity.type === 'battle' ? <Swords className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>

                  <div className="flex-1">
                    {activity.type === 'battle' ? (
                      <>
                        <p className="font-medium">
                          {activity.result === 'win' ? 'Won' : 'Lost'} vs {activity.opponent}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.eloChange! > 0 ? '+' : ''}{activity.eloChange} Elo
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Solved: {activity.problem}</p>
                        <p className="text-sm text-muted-foreground">{activity.difficulty}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
