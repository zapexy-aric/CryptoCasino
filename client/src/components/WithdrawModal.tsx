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
import { AlertTriangle, CheckCircle } from "lucide-react";

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
  const [step, setStep] = useState<"form" | "confirm" | "processing">("form");

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
      setStep("processing");
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Simulate processing delay
      setTimeout(() => {
        setAmount("");
        setAddress("");
        setStep("form");
        onClose();
      }, 3000);
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
      setStep("form");
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
    const fee = getWithdrawalFee(currency);

    if (withdrawAmount + fee > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least $${(withdrawAmount + fee).toFixed(2)} (including ${fee} ${currency} fee)`,
        variant: "destructive",
      });
      return;
    }

    setStep("confirm");
  };

  const confirmWithdraw = () => {
    withdrawMutation.mutate({
      amount,
      currency,
      address,
    });
  };

  const handleMaxAmount = () => {
    if (user?.balance) {
      const fee = getWithdrawalFee(currency);
      const maxAmount = Math.max(0, parseFloat(user.balance) - fee);
      setAmount(maxAmount.toString());
    }
  };

  const getWithdrawalFee = (currency: string) => {
    const fees = {
      USDT: 1,
      BTC: 0.0005,
      ETH: 0.005,
      INR: 0,
      SOL: 0.01,
    };
    return fees[currency as keyof typeof fees] || 1;
  };

  const calculateNetAmount = () => {
    const withdrawAmount = parseFloat(amount) || 0;
    const fee = getWithdrawalFee(currency);
    return Math.max(0, withdrawAmount - fee);
  };

  const getMinimumWithdrawal = (currency: string) => {
    const minimums = {
      USDT: 10,
      BTC: 0.001,
      ETH: 0.01,
      INR: 100,
      SOL: 0.1,
    };
    return minimums[currency as keyof typeof minimums] || 10;
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
        
        {step === "form" && (
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
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-primary hover:text-primary/80"
                      data-testid="button-max-withdraw"
                    >
                      MAX
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span data-testid="text-available-balance">
                      Available: ${user?.balance || "0.00"} USDT
                    </span>
                    <span data-testid="text-minimum-withdrawal">
                      Min: {getMinimumWithdrawal(currency)} {currency}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {currency === "INR" ? "UPI ID" : "Withdrawal Address"}
                  </label>
                  <Input
                    type="text"
                    placeholder={currency === "INR" ? "username@paytm or username@upi" : "Enter wallet address"}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    data-testid="input-withdraw-address"
                  />
                </div>
                
                <div className="bg-background rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Withdrawal Amount:</span>
                    <span className="font-medium" data-testid="text-withdrawal-amount">
                      {amount || "0.00"} {currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Network Fee:</span>
                    <span data-testid="text-network-fee">
                      {getWithdrawalFee(currency)} {currency}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span>You'll Receive:</span>
                      <span className="text-accent" data-testid="text-net-amount">
                        {calculateNetAmount().toFixed(currency === "INR" ? 2 : 8)} {currency}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleWithdraw}
                  disabled={!amount || !address || parseFloat(amount) < getMinimumWithdrawal(currency)}
                  className="w-full bg-destructive text-destructive-foreground"
                  data-testid="button-review-withdrawal"
                >
                  Review Withdrawal
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirm Withdrawal</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-medium">{currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{amount} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {currency === "INR" ? "UPI ID:" : "Address:"}
                    </span>
                    <span className="font-mono text-sm break-all">{address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network Fee:</span>
                    <span className="font-medium">{getWithdrawalFee(currency)} {currency}</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Net Amount:</span>
                      <span className="text-accent">
                        {calculateNetAmount().toFixed(currency === "INR" ? 2 : 8)} {currency}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium mb-2">⚠️ Important Warning</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Double-check the address/UPI ID - transactions cannot be reversed</li>
                    <li>• Withdrawals are processed within 24 hours</li>
                    <li>• Make sure your address supports the selected network</li>
                    {currency === "INR" && <li>• UPI transfers are instant during banking hours</li>}
                  </ul>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep("form")}
                    className="flex-1"
                    data-testid="button-back-to-form"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={confirmWithdraw}
                    disabled={withdrawMutation.isPending}
                    className="flex-1 bg-destructive text-destructive-foreground"
                    data-testid="button-confirm-withdrawal"
                  >
                    {withdrawMutation.isPending ? "Processing..." : "Confirm Withdrawal"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "processing" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Withdrawal Submitted</h3>
                <p className="text-muted-foreground mb-4">
                  Your withdrawal request has been submitted successfully and is being processed.
                </p>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Amount:</span>
                    <span className="font-medium">{amount} {currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Net Amount:</span>
                    <span className="font-medium text-accent">
                      {calculateNetAmount().toFixed(currency === "INR" ? 2 : 8)} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className="text-yellow-400">Processing</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  You will receive a notification once the withdrawal is completed.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
