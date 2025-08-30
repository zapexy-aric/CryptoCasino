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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USDT");
  const [upiId, setUpiId] = useState("");
  const [activeTab, setActiveTab] = useState("crypto");

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
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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

  const handleCryptoDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount,
      currency,
      method: "crypto",
    });
  };

  const handleUpiDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!upiId) {
      toast({
        title: "Invalid UPI ID",
        description: "Please enter a valid UPI ID",
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount,
      currency: "INR",
      method: "upi",
      address: upiId,
    });
  };

  const generateDepositAddress = (currency: string) => {
    const addresses = {
      BTC: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      ETH: "0x742d35Cc6634C0532925a3b8D8C6ef8c67e1a1a1",
      USDT: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
      SOL: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      DOGE: "DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L",
    };
    return addresses[currency as keyof typeof addresses] || addresses.USDT;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Deposit Funds</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto" className="flex items-center space-x-2" data-testid="tab-crypto">
              <i className="fas fa-bitcoin text-yellow-400"></i>
              <span>Cryptocurrency</span>
            </TabsTrigger>
            <TabsTrigger value="upi" className="flex items-center space-x-2" data-testid="tab-upi">
              <i className="fas fa-mobile-alt text-accent"></i>
              <span>UPI Payment</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Deposit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
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
                          <SelectItem value="DOGE">Dogecoin (DOGE)</SelectItem>
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
                    
                    <Button 
                      onClick={handleCryptoDeposit}
                      disabled={depositMutation.isPending}
                      className="w-full bg-primary text-primary-foreground"
                      data-testid="button-crypto-deposit"
                    >
                      {depositMutation.isPending ? "Processing..." : "Confirm Deposit"}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-background rounded-lg p-4 text-center">
                      <div className="w-48 h-48 mx-auto mb-3 rounded-lg bg-white flex items-center justify-center">
                        <div className="text-center">
                          <i className="fas fa-qrcode text-gray-600 text-6xl mb-2"></i>
                          <p className="text-xs text-gray-600">QR Code</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Deposit Address:</p>
                      <div className="bg-muted px-3 py-2 rounded break-all">
                        <p className="font-mono text-sm" data-testid="text-crypto-address">
                          {generateDepositAddress(currency)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-3">
                      <h5 className="font-medium mb-2">Important Notes:</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Only send {currency} to this address</li>
                        <li>• Minimum deposit: 0.001 {currency}</li>
                        <li>• Funds will be credited after 1 confirmation</li>
                        <li>• Do not send from exchange directly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upi" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>UPI Payment Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-medium">Pay with UPI ID</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                        <Input
                          type="number"
                          placeholder="Enter amount in INR"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          data-testid="input-upi-amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">UPI ID</label>
                        <Input
                          type="text"
                          placeholder="username@paytm / username@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          data-testid="input-upi-id"
                        />
                      </div>
                      <Button 
                        onClick={handleUpiDeposit}
                        disabled={depositMutation.isPending}
                        className="w-full bg-accent text-accent-foreground"
                        data-testid="button-pay-upi"
                      >
                        {depositMutation.isPending ? "Processing..." : "Pay with UPI"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="font-medium">Scan QR Code</h5>
                    <div className="text-center">
                      <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center mb-3">
                        <div className="text-center">
                          <i className="fas fa-qrcode text-gray-600 text-6xl mb-2"></i>
                          <p className="text-xs text-gray-600">UPI QR Code</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Scan with any UPI app</p>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">
                          Amount: ₹{amount || "0.00"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-muted rounded-lg p-4">
                  <h5 className="font-medium mb-2">Supported UPI Apps:</h5>
                  <div className="flex flex-wrap gap-2">
                    {["PhonePe", "Google Pay", "Paytm", "BHIM", "Amazon Pay"].map((app) => (
                      <span key={app} className="text-xs bg-background px-2 py-1 rounded" data-testid={`upi-app-${app.toLowerCase().replace(' ', '-')}`}>
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
