import { FeatureCard } from "@/components/FeatureCard";
import { 
  Swords, 
  Trophy, 
  Container, 
  Brain, 
  LineChart, 
  Zap 
} from "lucide-react";

const features = [
  {
    icon: Swords,
    title: "Real-Time Battles",
    description:
      "Compete head-to-head in live 1v1 coding duels. Same problem, same clock—may the best coder win.",
    gradient: "from-primary to-pink-500",
  },
  {
    icon: Trophy,
    title: "Elo Tier System",
    description:
      "Rise through 5 tiers from Nova to Celestia. Your rank reflects your true competitive skill.",
    gradient: "from-tier-luminary to-amber-500",
  },
  {
    icon: Container,
    title: "Docker Judging",
    description:
      "Secure, isolated code execution with instant verdicts. AC, WA, TLE, RE—know immediately.",
    gradient: "from-accent to-cyan-400",
  },
  {
    icon: Brain,
    title: "Aptitude Tests",
    description:
      "Placement-ready assessments covering quantitative, logical, and verbal abilities.",
    gradient: "from-tier-stellar to-purple-400",
  },
  {
    icon: LineChart,
    title: "Skill Analytics",
    description:
      "Track your progress with detailed performance metrics, rating history, and weak areas.",
    gradient: "from-success to-emerald-400",
  },
  {
    icon: Zap,
    title: "WebSocket Live",
    description:
      "Zero-latency updates during battles. See opponent submissions in real-time.",
    gradient: "from-tier-cosmic to-red-400",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for <span className="gradient-text">Competitive Edge</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to level up your coding skills and ace placements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
