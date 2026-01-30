import { cn } from "@/lib/utils";
import { Diamond, Circle, Star, Plus, Crown } from "lucide-react";

export type TierName = "Nova" | "Stellar" | "Luminary" | "Cosmic" | "Celestia";

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
    name: "Nova",
    range: "800–1099",
    icon: Diamond,
    level: "Beginner",
    className: "tier-nova",
    glowClass: "shadow-cyan-500/50",
  },
  {
    name: "Stellar",
    range: "1100–1399",
    icon: Circle,
    level: "Intermediate",
    className: "tier-stellar",
    glowClass: "shadow-purple-500/50",
  },
  {
    name: "Luminary",
    range: "1400–1699",
    icon: Star,
    level: "Advanced",
    className: "tier-luminary",
    glowClass: "shadow-yellow-500/50",
  },
  {
    name: "Cosmic",
    range: "1700–1999",
    icon: Plus,
    level: "Expert",
    className: "tier-cosmic",
    glowClass: "shadow-orange-500/50",
  },
  {
    name: "Celestia",
    range: "2000+",
    icon: Crown,
    level: "Master",
    className: "tier-celestia",
    glowClass: "shadow-pink-500/50",
  },
];

export function getTierByElo(elo: number): TierInfo {
  if (elo >= 2000) return tiers[4];
  if (elo >= 1700) return tiers[3];
  if (elo >= 1400) return tiers[2];
  if (elo >= 1100) return tiers[1];
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
