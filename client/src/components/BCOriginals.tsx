interface BCOriginalsProps {
  onMinesClick: () => void;
}

export default function BCOriginals({ onMinesClick }: BCOriginalsProps) {
  const games = [
    { name: "NeZha", badge: "Exclusive", players: 68, icon: "fa-dragon" },
    { name: "Bullet Spin", badge: "New", players: 46, icon: "fa-spinner" },
    { name: "Mines", badge: "Featured", players: 227, icon: "fa-bomb", onClick: onMinesClick },
    { name: "Plinko", badge: "Popular", players: 224, icon: "fa-circle" },
    { name: "Crash", badge: "Hot", players: 2213, icon: "fa-rocket" },
    { name: "Classic Dice", badge: "Classic", players: 100, icon: "fa-dice" },
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Exclusive": return "bg-primary/20 text-primary";
      case "New": return "bg-accent/20 text-accent";
      case "Featured": return "bg-destructive/20 text-destructive";
      case "Popular": return "bg-blue-500/20 text-blue-400";
      case "Hot": return "bg-red-500/20 text-red-400";
      default: return "bg-muted-foreground/20 text-muted-foreground";
    }
  };

  return (
    <section className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">BC Originals</span>
        </h2>
        <button className="text-primary hover:text-primary/80 text-sm" data-testid="button-view-all-originals">View All</button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {games.map((game) => (
          <div 
            key={game.name}
            onClick={game.onClick}
            className={`game-card bg-muted rounded-xl overflow-hidden transition-all duration-300 ${game.onClick ? 'cursor-pointer ring-2 ring-primary' : 'cursor-pointer'}`}
            data-testid={`card-game-${game.name.toLowerCase().replace(' ', '-')}`}
          >
            <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <i className={`fas ${game.icon} text-4xl text-primary`}></i>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded ${getBadgeColor(game.badge)}`}>
                  {game.badge}
                </span>
                <div className="flex items-center text-xs text-yellow-400">
                  <i className="fas fa-users mr-1"></i>
                  <span data-testid={`text-players-${game.name.toLowerCase().replace(' ', '-')}`}>
                    {game.players}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-sm" data-testid={`text-game-name-${game.name.toLowerCase().replace(' ', '-')}`}>
                {game.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
