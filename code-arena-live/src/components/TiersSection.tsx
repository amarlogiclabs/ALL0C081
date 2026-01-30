import { tiers, TierCard } from "@/components/TierBadge";

export function TiersSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 cosmic-bg opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Climb the <span className="gradient-text-cosmic">Ranks</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Progress through 5 competitive tiers based on your Elo rating
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TierCard tier={tier} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
