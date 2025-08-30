import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GameState {
  sessionId: string | null;
  gameActive: boolean;
  revealedCells: number[];
  multiplier: number;
  payout: number;
  minesCount: number;
  safeCount: number;
}

export default function Mines() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    gameActive: false,
    revealedCells: [],
    multiplier: 1,
    payout: 0,
    minesCount: 3,
    safeCount: 0,
  });
  
  const [betAmount, setBetAmount] = useState("10");
  const [selectedMines, setSelectedMines] = useState("3");

  useEffect(() => {
    if (!isAuthenticated) {
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
        multiplier: 1,
        payout: 0,
        minesCount: data.minesCount,
        safeCount: data.safeCount,
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
      }));

      if (data.gameOver) {
        toast({
          title: "Game Over",
          description: data.cellType === 'mine' ? "You hit a mine!" : "Game completed!",
          variant: data.cellType === 'mine' ? "destructive" : "default",
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
      setGameState(prev => ({
        ...prev,
        gameActive: false,
        sessionId: null,
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Cashout Successful",
        description: `Won $${data.payout.toFixed(2)} (${data.multiplier}x)`,
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
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Bet",
        description: "Please enter a valid bet amount",
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
    if (!gameState.gameActive || !gameState.sessionId || gameState.revealedCells.includes(cellIndex)) {
      return;
    }

    revealCellMutation.mutate({
      sessionId: gameState.sessionId,
      cellIndex,
    });
  };

  const handleCashout = () => {
    if (!gameState.sessionId) return;
    
    cashoutMutation.mutate({
      sessionId: gameState.sessionId,
    });
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        sidebarOpen={false}
        setSidebarOpen={() => {}}
        isAuthenticated={true}
        user={user}
      />
      
      <div className="pt-16 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-destructive to-red-600 rounded-xl flex items-center justify-center">
                <i className="fas fa-bomb text-white"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mines</h1>
                <p className="text-muted-foreground">Find gems, avoid mines</p>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-5 gap-2 mb-6" data-testid="mines-board">
                    {Array(25).fill(null).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleCellClick(index)}
                        disabled={!gameState.gameActive || gameState.revealedCells.includes(index)}
                        className={`
                          w-16 h-16 rounded-lg transition-colors flex items-center justify-center text-xl font-bold
                          ${gameState.revealedCells.includes(index)
                            ? 'bg-secondary/80 cursor-not-allowed'
                            : gameState.gameActive
                            ? 'bg-secondary hover:bg-secondary/80 cursor-pointer'
                            : 'bg-secondary/50 cursor-not-allowed'
                          }
                        `}
                        data-testid={`mines-cell-${index}`}
                      >
                        {gameState.revealedCells.includes(index) ? (
                          <i className="fas fa-gem text-accent"></i>
                        ) : (
                          <i className="fas fa-question text-muted-foreground"></i>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Multiplier</p>
                          <p className="text-2xl font-bold text-accent" data-testid="text-multiplier">
                            {gameState.multiplier.toFixed(2)}x
                          </p>
                        </div>
                        <div>
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
                    <label className="block text-sm font-medium mb-2">Bet Amount</label>
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-primary"
                        onClick={() => setBetAmount(user?.balance || "0")}
                        data-testid="button-max-bet"
                      >
                        MAX
                      </button>
                    </div>
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
                      disabled={startGameMutation.isPending}
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-3 text-lg font-bold"
                      data-testid="button-start-game"
                    >
                      {startGameMutation.isPending ? "Starting..." : "Start Game"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCashout}
                      disabled={cashoutMutation.isPending || gameState.payout === 0}
                      className="w-full bg-gradient-to-r from-accent to-green-600 text-white py-3 text-lg font-bold"
                      data-testid="button-cashout"
                    >
                      {cashoutMutation.isPending ? "Cashing out..." : `Cashout $${gameState.payout.toFixed(2)}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
