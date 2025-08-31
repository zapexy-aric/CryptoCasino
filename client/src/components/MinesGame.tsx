import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameState {
  sessionId: string | null;
  gameActive: boolean;
  revealedCells: number[];
  minePositions: number[];
  multiplier: number;
  payout: number;
  minesCount: number;
  safeCount: number;
  gameOver: boolean;
}

interface MinesGameProps {
  className?: string;
}

export default function MinesGame({ className }: MinesGameProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    gameActive: false,
    revealedCells: [],
    minePositions: [],
    multiplier: 1,
    payout: 0,
    minesCount: 3,
    safeCount: 0,
    gameOver: false,
  });
  
  const [betAmount, setBetAmount] = useState("10");
  const [selectedMines, setSelectedMines] = useState("3");
  const [recentPlays, setRecentPlays] = useState<Array<{multiplier: number, profit: number}>>([]);

  const gemSoundRef = useRef<HTMLAudioElement>(null);
  const mineSoundRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to login to play games.",
        variant: "destructive",
      });
      return;
    }
  }, [isAuthenticated, toast]);

  const startGameMutation = useMutation({
    mutationFn: async ({ betAmount, minesCount }: { betAmount: string; minesCount: number }) => {
      const response = await apiRequest("POST", "/api/games/mines/start", {
        betAmount,
        minesCount,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setGameState({
        sessionId: data.sessionId,
        gameActive: true,
        revealedCells: [],
        minePositions: [],
        multiplier: 1,
        payout: 0,
        minesCount: data.minesCount,
        safeCount: data.safeCount,
        gameOver: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Game Started",
        description: `Mines: ${data.minesCount}, Safe cells: ${data.safeCount}`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to start game",
        variant: "destructive",
      });
    },
  });

  const revealCellMutation = useMutation({
    mutationFn: async ({ sessionId, cellIndex }: { sessionId: string; cellIndex: number }) => {
      const response = await apiRequest("POST", "/api/games/mines/reveal", {
        sessionId,
        cellIndex,
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      setGameState(prev => ({
        ...prev,
        revealedCells: [...prev.revealedCells, variables.cellIndex],
        multiplier: data.multiplier || prev.multiplier,
        payout: data.payout || prev.payout,
        gameActive: !data.gameOver,
        gameOver: data.gameOver,
      }));

      if (data.gameOver) {
        if (data.cellType === 'mine') {
          mineSoundRef.current?.play();
          // Add to recent plays as a loss
          setRecentPlays(prev => [
            { multiplier: 0, profit: -parseFloat(betAmount) },
            ...prev.slice(0, 4)
          ]);
          
          toast({
            title: "Game Over",
            description: "You hit a mine! Better luck next time.",
            variant: "destructive",
          });
        }
      } else {
        gemSoundRef.current?.play();
        toast({
          title: "Safe!",
          description: `Found a gem! Multiplier: ${data.multiplier.toFixed(2)}x`,
        });
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to reveal cell",
        variant: "destructive",
      });
    },
  });

  const cashoutMutation = useMutation({
    mutationFn: async ({ sessionId }: { sessionId: string }) => {
      const response = await apiRequest("POST", "/api/games/mines/cashout", {
        sessionId,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const profit = data.payout - parseFloat(betAmount);
      
      setRecentPlays(prev => [
        { multiplier: data.multiplier, profit },
        ...prev.slice(0, 4)
      ]);
      
      setGameState(prev => ({
        ...prev,
        gameActive: false,
        sessionId: null,
        gameOver: false,
      }));
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Cashout Successful",
        description: `Won $${data.payout.toFixed(2)} (${data.multiplier.toFixed(2)}x)`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to cash out",
        variant: "destructive",
      });
    },
  });

  const handleStartGame = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to play games.",
        variant: "destructive",
      });
      return;
    }

    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(user?.balance || "0");
    const bet = parseFloat(betAmount);

    if (bet > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      return;
    }

    startGameMutation.mutate({
      betAmount,
      minesCount: parseInt(selectedMines),
    });
  };

  const handleCellClick = (cellIndex: number) => {
    if (!gameState.gameActive || !gameState.sessionId || gameState.revealedCells.includes(cellIndex) || gameState.gameOver) {
      return;
    }

    revealCellMutation.mutate({
      sessionId: gameState.sessionId,
      cellIndex,
    });
  };

  const handleCashout = () => {
    if (!gameState.sessionId || gameState.payout === 0) return;
    
    cashoutMutation.mutate({
      sessionId: gameState.sessionId,
    });
  };

  const getCellContent = (index: number) => {
    if (!gameState.revealedCells.includes(index)) {
      return <i className="fas fa-question text-muted-foreground"></i>;
    }
    
    // If game is over and this cell was revealed, show the actual content
    if (gameState.gameOver && gameState.minePositions.includes(index)) {
      return <i className="fas fa-bomb text-destructive"></i>;
    }
    
    return <i className="fas fa-gem text-accent"></i>;
  };

  const getCellClass = (index: number) => {
    const baseClass = "w-16 h-16 rounded-lg transition-all duration-300 flex items-center justify-center text-xl font-bold";
    
    if (gameState.revealedCells.includes(index)) {
      if (gameState.gameOver && gameState.minePositions.includes(index)) {
        return `${baseClass} bg-destructive/20 border-2 border-destructive cursor-not-allowed`;
      }
      return `${baseClass} bg-accent/20 border-2 border-accent cursor-not-allowed`;
    }
    
    if (gameState.gameActive && !gameState.gameOver) {
      return `${baseClass} bg-secondary hover:bg-secondary/80 cursor-pointer hover:scale-105`;
    }
    
    return `${baseClass} bg-secondary/50 cursor-not-allowed`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-destructive to-red-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-bomb text-white"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Mines</h3>
                  <p className="text-sm text-muted-foreground">Find gems, avoid mines</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-6" data-testid="mines-board">
                {Array(25).fill(null).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={!gameState.gameActive || gameState.revealedCells.includes(index) || gameState.gameOver || !isAuthenticated}
                    className={getCellClass(index)}
                    data-testid={`mines-cell-${index}`}
                  >
                    {getCellContent(index)}
                  </button>
                ))}
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Current Multiplier</p>
                      <p className="text-2xl font-bold text-accent" data-testid="text-multiplier">
                        {gameState.multiplier.toFixed(2)}x
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Potential Payout</p>
                      <p className="text-2xl font-bold text-primary" data-testid="text-payout">
                        ${gameState.payout.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
        
        {/* Game Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bet Amount (USDT)</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    disabled={gameState.gameActive}
                    data-testid="input-bet-amount"
                  />
                  <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-primary hover:text-primary/80"
                    onClick={() => setBetAmount(user?.balance || "0")}
                    disabled={gameState.gameActive}
                    data-testid="button-max-bet"
                  >
                    MAX
                  </button>
                </div>
                {isAuthenticated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance: ${user?.balance || "0.00"} USDT
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Mines Count</label>
                <Select value={selectedMines} onValueChange={setSelectedMines} disabled={gameState.gameActive}>
                  <SelectTrigger data-testid="select-mines-count">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Mine</SelectItem>
                    <SelectItem value="3">3 Mines</SelectItem>
                    <SelectItem value="5">5 Mines</SelectItem>
                    <SelectItem value="10">10 Mines</SelectItem>
                    <SelectItem value="24">24 Mines</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {!gameState.gameActive ? (
                <Button 
                  onClick={handleStartGame}
                  disabled={startGameMutation.isPending || !isAuthenticated}
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 text-lg font-bold"
                  data-testid="button-start-game"
                >
                  {startGameMutation.isPending ? "Starting..." : !isAuthenticated ? "Login to Play" : "Start Game"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    onClick={handleCashout}
                    disabled={cashoutMutation.isPending || gameState.payout === 0 || gameState.gameOver}
                    className="w-full bg-gradient-to-r from-accent to-green-600 text-white py-3 text-lg font-bold"
                    data-testid="button-cashout"
                  >
                    {cashoutMutation.isPending ? "Cashing out..." : `Cashout $${gameState.payout.toFixed(2)}`}
                  </Button>
                  
                  {gameState.gameOver && (
                    <Button 
                      onClick={() => setGameState(prev => ({ ...prev, gameActive: false, sessionId: null, revealedCells: [], gameOver: false }))}
                      className="w-full bg-secondary text-secondary-foreground py-2"
                      data-testid="button-new-game"
                    >
                      New Game
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {recentPlays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentPlays.map((play, index) => (
                    <div key={index} className="flex items-center justify-between text-sm" data-testid={`recent-play-${index}`}>
                      <span data-testid={`text-play-multiplier-${index}`}>
                        {play.multiplier > 0 ? `${play.multiplier.toFixed(2)}x` : "Mine Hit"}
                      </span>
                      <span 
                        className={play.profit >= 0 ? "text-accent" : "text-destructive"}
                        data-testid={`text-play-profit-${index}`}
                      >
                        {play.profit >= 0 ? "+" : ""}${play.profit.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Choose your bet amount and number of mines</p>
                <p>• Click on cells to reveal gems or mines</p>
                <p>• Each gem increases your multiplier</p>
                <p>• Cash out anytime to secure your winnings</p>
                <p>• Hit a mine and lose everything!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <audio ref={gemSoundRef} src="/gem_reveal.wav" preload="auto" />
      <audio ref={mineSoundRef} src="/mine_blast.wav" preload="auto" />
    </div>
  );
}
