import { Users, Swords, Zap } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  pulse?: boolean;
}

function StatItem({ icon: Icon, value, label, pulse }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 glass-card rounded-xl">
      <div className="relative">
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-50" />
        )}
        <div className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function LiveStats() {
  // Mock data - replace with real-time data later
  const stats = {
    onlineUsers: 1247,
    ongoingBattles: 89,
    problemsSolved: "50K+",
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <StatItem
        icon={Users}
        value={stats.onlineUsers.toLocaleString()}
        label="Online Now"
        pulse
      />
      <StatItem
        icon={Swords}
        value={stats.ongoingBattles}
        label="Live Battles"
        pulse
      />
      <StatItem
        icon={Zap}
        value={stats.problemsSolved}
        label="Problems Solved"
      />
    </div>
  );
}
