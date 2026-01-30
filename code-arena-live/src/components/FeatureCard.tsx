import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = "from-primary to-accent",
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group glass-card-hover p-6 rounded-2xl transition-all duration-300",
        className
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110",
          gradient
        )}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}
