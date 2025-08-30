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

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "upi">("crypto");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [upiId, setUpiId] = useState("");

  const depositMutation = useMutation({
    mutationFn: async ({ amount, currency, method, address }: { amount: string; currency: string; method: string; address?: string }) => {
      const response = await apiRequest("POST", "/api/transactions/deposit", {
        amount,
        currency,
        method,
        address,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Deposit Initiated",
        description: "Your deposit request has been submitted successfully.",
      });
      setAmount("");
      setUpiId("");
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
        description: error.message || "Failed to process deposit",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "upi" && !upiId) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount,
      currency: paymentMethod === "upi" ? "INR" : currency,
      method: paymentMethod,
      address: paymentMethod === "upi" ? upiId : undefined,
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deposit Funds</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <h4 className="font-medium mb-4">Select Payment Method</h4>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={paymentMethod === "crypto" ? "default" : "outline"}
                onClick={() => setPaymentMethod("crypto")}
                className="h-20 flex-col space-y-2"
                data-testid="button-crypto-method"
              >
                <i className="fas fa-bitcoin text-yellow-400 text-2xl"></i>
                <div className="text-center">
                  <p className="font-medium">Cryptocurrency</p>
                  <p className="text-xs text-muted-foreground">BTC, ETH, USDT</p>
                </div>
              </Button>
              <Button
                variant={paymentMethod === "upi" ? "default" : "outline"}
                onClick={() => setPaymentMethod("upi")}
                className="h-20 flex-col space-y-2"
                data-testid="button-upi-method"
              >
                <i className="fas fa-mobile-alt text-accent text-2xl"></i>
                <div className="text-center">
                  <p className="font-medium">UPI Payment</p>
                  <p className="text-xs text-muted-foreground">UPI ID & QR Code</p>
                </div>
              </Button>
            </div>
          </div>
          
          {/* UPI Payment Section */}
          {paymentMethod === "upi" && (
            <Card>
              <CardHeader>
                <CardTitle>UPI Payment Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-3">Pay with UPI ID</h5>
                    <div className="space-y-3">
                      <Input
                        type="number"
                        placeholder="Enter amount (₹)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        data-testid="input-upi-amount"
                      />
                      <Input
                        type="text"
                        placeholder="Enter your UPI ID"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        data-testid="input-upi-id"
                      />
                      <Button 
                        onClick={handleDeposit}
                        disabled={depositMutation.isPending}
                        className="w-full bg-accent text-accent-foreground"
                        data-testid="button-pay-upi"
                      >
                        {depositMutation.isPending ? "Processing..." : "Pay with UPI"}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-3">Scan QR Code</h5>
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-3">
                        <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                          <i className="fas fa-qrcode text-gray-600 text-4xl"></i>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Scan with any UPI app</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Crypto Payment Section */}
          {paymentMethod === "crypto" && (
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Deposit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger data-testid="select-crypto-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-crypto-amount"
                  />
                </div>
                
                <div className="bg-background rounded-lg p-4 text-center">
                  <div className="w-32 h-32 mx-auto mb-3 rounded-lg bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-qrcode text-gray-600 text-3xl"></i>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Deposit Address:</p>
                  <p className="font-mono text-sm bg-muted px-3 py-2 rounded break-all" data-testid="text-crypto-address">
                    {currency === "BTC" && "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}
                    {currency === "ETH" && "0x742d35Cc6634C0532925a3b8D8C6ef8c67e1a1a1"}
                    {currency === "USDT" && "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"}
                    {currency === "SOL" && "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"}
                  </p>
                </div>
                
                <Button 
                  onClick={handleDeposit}
                  disabled={depositMutation.isPending}
                  className="w-full bg-primary text-primary-foreground"
                  data-testid="button-generate-address"
                >
                  {depositMutation.isPending ? "Processing..." : "Confirm Deposit"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
