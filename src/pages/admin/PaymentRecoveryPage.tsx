import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function PaymentRecoveryPage() {
  const [proposalId, setProposalId] = useState("39013ef4-305e-4050-ab47-6581b74d7105");
  const [paymentIntentId, setPaymentIntentId] = useState("pi_3SAwQrHWGWiVIBuolIRzGuz5");
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();

  const handleRecover = async () => {
    if (!proposalId || !paymentIntentId) {
      toast({
        title: "Missing Information",
        description: "Please provide both proposal ID and payment intent ID",
        variant: "destructive",
      });
      return;
    }

    setIsRecovering(true);

    try {
      const { data, error } = await supabase.functions.invoke("recover-payment", {
        body: {
          proposalId,
          stripePaymentIntentId: paymentIntentId,
        },
      });

      if (error) throw error;

      toast({
        title: "Payment Recovered",
        description: `Successfully updated proposal and created order ${data.order.id}`,
      });

      console.log("Recovery result:", data);
    } catch (error: any) {
      console.error("Recovery error:", error);
      toast({
        title: "Recovery Failed",
        description: error.message || "Failed to recover payment",
        variant: "destructive",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Payment Recovery Tool</CardTitle>
          <CardDescription>
            Manually recover failed Stripe payments and create missing orders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proposalId">Proposal ID</Label>
            <Input
              id="proposalId"
              value={proposalId}
              onChange={(e) => setProposalId(e.target.value)}
              placeholder="39013ef4-305e-4050-ab47-6581b74d7105"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentIntentId">Stripe Payment Intent ID</Label>
            <Input
              id="paymentIntentId"
              value={paymentIntentId}
              onChange={(e) => setPaymentIntentId(e.target.value)}
              placeholder="pi_3SAwQrHWGWiVIBuolIRzGuz5"
            />
          </div>

          <Button
            onClick={handleRecover}
            disabled={isRecovering}
            className="w-full"
          >
            {isRecovering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Recover Payment & Create Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
