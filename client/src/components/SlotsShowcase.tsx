export default function SlotsShowcase() {
  const slots = [
    { name: "Gems Bonanza", provider: "Pragmatic Play", rtp: "96.51%", rating: 5 },
    { name: "Sugar Rush 1000", provider: "Pragmatic Play", rtp: "96.50%", rating: 4 },
    { name: "Gates of Olympus", provider: "Pragmatic Play", rtp: "96.50%", rating: 5 },
    { name: "Blade & Fangs", provider: "Pragmatic Play", rtp: "96.65%", rating: 4 },
    { name: "Forge of Olympus", provider: "Pragmatic Play", rtp: "96.48%", rating: 5 },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i 
        key={i} 
        className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`}
      ></i>
    ));
  };

  return (
    <section className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Popular Slots</h2>
        <button className="text-primary hover:text-primary/80 text-sm" data-testid="button-view-all-slots">View All</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {slots.map((slot) => (
          <div key={slot.name} className="game-card bg-muted rounded-xl overflow-hidden cursor-pointer transition-all duration-300" data-testid={`card-slot-${slot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <i className="fas fa-gem text-4xl text-primary"></i>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm mb-1" data-testid={`text-slot-name-${slot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                {slot.name}
              </h3>
              <p className="text-xs text-muted-foreground" data-testid={`text-provider-${slot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                {slot.provider}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-accent" data-testid={`text-rtp-${slot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                  RTP: {slot.rtp}
                </span>
                <div className="flex text-xs" data-testid={`rating-${slot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                  {renderStars(slot.rating)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
