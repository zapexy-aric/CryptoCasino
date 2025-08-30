import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [address, setAddress] = useState("");

  const withdrawMutation = useMutation({
    mutationFn: async ({ amount, currency, address }: { amount: string; currency: string; address: string }) => {
      const response = await apiRequest("POST", "/api/transactions/withdraw", {
        amount,
        currency,
        address,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setAmount("");
      setAddress("");
      onClose();
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
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!address) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid address or UPI ID",
        variant: "destructive",
      });
      return;
    }

    const userBalance = parseFloat(user?.balance || "0");
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount,
      currency,
      address,
    });
  };

  const handleMaxAmount = () => {
    if (user?.balance) {
      // Leave 1 USDT for fees
      const maxAmount = Math.max(0, parseFloat(user.balance) - 1);
      setAmount(maxAmount.toString());
    }
  };

  const calculateNetAmount = () => {
    const withdrawAmount = parseFloat(amount) || 0;
    const fee = 1; // 1 USDT fee
    return Math.max(0, withdrawAmount - fee);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger data-testid="select-withdraw-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT (TRC20)</SelectItem>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="INR">UPI Transfer (INR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-withdraw-amount"
                  />
                  <button 
                    onClick={handleMaxAmount}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-primary"
                    data-testid="button-max-withdraw"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1" data-testid="text-available-balance">
                  Available: ${user?.balance || "0.00"} USDT
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  {currency === "INR" ? "UPI ID" : "Withdrawal Address"}
                </label>
                <Input
                  type="text"
                  placeholder={currency === "INR" ? "Enter your UPI ID" : "Enter wallet address"}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  data-testid="input-withdraw-address"
                />
              </div>
              
              <div className="bg-background rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Network Fee:</span>
                  <span data-testid="text-network-fee">1.00 {currency}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span>You'll Receive:</span>
                  <span className="font-bold" data-testid="text-net-amount">
                    {calculateNetAmount().toFixed(2)} {currency}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="w-full bg-destructive text-destructive-foreground"
                data-testid="button-request-withdrawal"
              >
                {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
