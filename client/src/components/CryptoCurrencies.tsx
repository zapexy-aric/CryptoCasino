export default function CryptoCurrencies() {
  const cryptocurrencies = [
    { symbol: "BTC", name: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum" },
    { symbol: "USDT", name: "Tether" },
    { symbol: "SOL", name: "Solana" },
    { symbol: "DOGE", name: "Dogecoin" },
  ];

  return (
    <section className="bg-card rounded-xl p-6 border border-border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Supported Cryptocurrencies</h2>
        <p className="text-muted-foreground">130+ cryptocurrencies & 40+ fiat options</p>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-6">
        {cryptocurrencies.map((crypto) => (
          <div key={crypto.symbol} className="flex items-center space-x-2 bg-muted rounded-lg px-4 py-2" data-testid={`crypto-${crypto.symbol.toLowerCase()}`}>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">{crypto.symbol.charAt(0)}</span>
            </div>
            <span className="font-medium" data-testid={`text-crypto-${crypto.symbol.toLowerCase()}`}>{crypto.symbol}</span>
          </div>
        ))}
        <span className="text-muted-foreground">+125 more</span>
      </div>
    </section>
  );
}
