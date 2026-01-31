import { cn } from "@/lib/utils";
import { Diamond, Circle, Star, Plus, Crown, Cloud, Zap, Sun, Moon, Globe, Trophy } from "lucide-react";

export type TierName = "Nebula" | "Nova" | "Stellar" | "Luminary" | "Cosmic" | "Galactic" | "Celestia" | "Universal";

interface TierInfo {
  name: TierName;
  range: string;
  icon: React.ElementType;
  level: string;
  className: string;
  glowClass: string;
}

export const tiers: TierInfo[] = [
  {
    name: "Nebula",
    range: "< 1000",
    icon: Cloud,
    level: "Beginner",
    className: "tier-nebula text-slate-400 bg-slate-400/10 border-slate-400/20",
    glowClass: "shadow-slate-500/50",
  },
  {
    name: "Nova",
    range: "1000–1199",
    icon: Zap,
    level: "Rookie",
    className: "tier-nova text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    glowClass: "shadow-cyan-500/50",
  },
  {
    name: "Stellar",
    range: "1200–1399",
    icon: Star,
    level: "Intermediate",
    className: "tier-stellar text-blue-400 bg-blue-400/10 border-blue-400/20",
    glowClass: "shadow-blue-500/50",
  },
  {
    name: "Luminary",
    range: "1400–1599",
    icon: Sun,
    level: "Advanced",
    className: "tier-luminary text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    glowClass: "shadow-yellow-500/50",
  },
  {
    name: "Cosmic",
    range: "1600–1799",
    icon: Moon,
    level: "Expert",
    className: "tier-cosmic text-purple-400 bg-purple-400/10 border-purple-400/20",
    glowClass: "shadow-purple-500/50",
  },
  {
    name: "Galactic",
    range: "1800–1999",
    icon: Globe,
    level: "Elite",
    className: "tier-galactic text-pink-400 bg-pink-400/10 border-pink-400/20",
    glowClass: "shadow-pink-500/50",
  },
  {
    name: "Celestia",
    range: "2000–2399",
    icon: Crown,
    level: "Master",
    className: "tier-celestia text-orange-500 bg-orange-500/10 border-orange-500/20",
    glowClass: "shadow-orange-500/50",
  },
  {
    name: "Universal",
    range: "2400+",
    icon: Trophy,
    level: "Legend",
    className: "tier-universal text-red-500 bg-red-500/10 border-red-500/20",
    glowClass: "shadow-red-500/50",
  },
];

export function getTierByElo(elo: number): TierInfo {
  if (elo >= 2400) return tiers[7];
  if (elo >= 2000) return tiers[6];
  if (elo >= 1800) return tiers[5];
  if (elo >= 1600) return tiers[4];
  if (elo >= 1400) return tiers[3];
  if (elo >= 1200) return tiers[2];
  if (elo >= 1000) return tiers[1];
  return tiers[0];
}

interface TierBadgeProps {
  tier: TierName;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function TierBadge({ tier, size = "md", showLabel = false, className }: TierBadgeProps) {
  const tierInfo = tiers.find((t) => t.name === tier) || tiers[0];
  const Icon = tierInfo.icon;

  const sizeClasses = {
    sm: "h-6 px-2 text-xs gap-1",
    md: "h-8 px-3 text-sm gap-1.5",
    lg: "h-10 px-4 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-semibold shadow-lg",
        tierInfo.className,
        tierInfo.glowClass,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{tierInfo.name}</span>}
    </div>
  );
}

interface TierCardProps {
  tier: TierInfo;
  isActive?: boolean;
}

export function TierCard({ tier, isActive = false }: TierCardProps) {
  const Icon = tier.icon;

  return (
    <div
      className={cn(
        "glass-card-hover p-6 text-center transition-all duration-300",
        isActive && "ring-2 ring-primary scale-105"
      )}
    >
      <div
        className={cn(
          "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-lg",
          tier.className,
          tier.glowClass
        )}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
      <p className="text-muted-foreground text-sm mb-2">{tier.level}</p>
      <p className="text-xs font-mono text-accent">{tier.range} Elo</p>
    </div>
  );
}
