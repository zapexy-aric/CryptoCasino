export default function LiveSports() {
  const liveMatches = [
    {
      id: 1,
      homeTeam: "Real Madrid",
      awayTeam: "RCD Mallorca",
      homeScore: 2,
      awayScore: 1,
      status: "2nd half",
      odds: ["1.02", "12.0", "220.0"],
      league: "LaLiga"
    },
    {
      id: 2,
      homeTeam: "Arsenal FC",
      awayTeam: "Manchester City",
      homeScore: 0,
      awayScore: 0,
      status: "1st half",
      odds: ["3.7", "2.8", "2.1"],
      league: "Premier League"
    }
  ];

  return (
    <section className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <i className="fas fa-broadcast-tower text-red-500 mr-3"></i>
          Live Sports
        </h2>
        <button className="text-primary hover:text-primary/80 text-sm" data-testid="button-view-all-sports">View All</button>
      </div>
      
      <div className="space-y-4">
        {liveMatches.map((match) => (
          <div key={match.id} className="bg-muted rounded-lg p-4 flex items-center justify-between" data-testid={`card-match-${match.id}`}>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{match.homeTeam.charAt(0)}</span>
                </div>
                <span className="font-medium" data-testid={`text-home-team-${match.id}`}>{match.homeTeam}</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent" data-testid={`text-score-${match.id}`}>
                  {match.homeScore}:{match.awayScore}
                </div>
                <div className="text-xs text-red-500" data-testid={`text-status-${match.id}`}>{match.status}</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{match.awayTeam.charAt(0)}</span>
                </div>
                <span className="font-medium" data-testid={`text-away-team-${match.id}`}>{match.awayTeam}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {match.odds.map((odd, index) => (
                <button 
                  key={index}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    index === 0 ? 'bg-accent text-accent-foreground' :
                    index === 1 ? 'bg-muted-foreground text-background' :
                    'bg-destructive text-destructive-foreground'
                  }`}
                  data-testid={`button-odds-${match.id}-${index}`}
                >
                  {odd}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
