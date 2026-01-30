import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm">Free to join • No credit card required</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to prove your{" "}
            <span className="gradient-text">skills</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10">
            Join the arena today and start competing with coders worldwide. 
            Track your progress, climb the ranks, and prepare for placements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Create Free Account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/practice">
              <Button variant="heroOutline" size="xl">
                Try Without Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
