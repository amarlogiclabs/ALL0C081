import { Button } from "@/components/ui/button";
import { LiveStats } from "@/components/LiveStats";
import { Swords, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cosmic-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float delay-300" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Live battles happening now
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
            <span className="gradient-text">Compete.</span>{" "}
            <span className="text-foreground">Learn.</span>{" "}
            <span className="gradient-text-cosmic">Level Up.</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Real-time 1v1 coding battles, Elo rankings, and placement preparation. 
            Join thousands of competitive programmers sharpening their skills.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up delay-200">
            <Link to="/battles">
              <Button variant="hero" size="xl" className="group">
                <Swords className="w-5 h-5" />
                Start Battle
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/practice">
              <Button variant="heroOutline" size="xl">
                <BookOpen className="w-5 h-5" />
                Practice Problems
              </Button>
            </Link>
          </div>

          {/* Live Stats */}
          <div className="animate-slide-up delay-300">
            <LiveStats />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
