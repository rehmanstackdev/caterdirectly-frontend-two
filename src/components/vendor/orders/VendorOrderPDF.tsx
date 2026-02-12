import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  title: string;
  date: string;
  location: string;
  guests: number;
  price: number;
  status: string;
  payment_status: string;
  service_details: string;
  host_id: string;
  vendor_name: string;
}

interface VendorOrderPDFProps {
  order: Order;
  vendorId: string;
}

export const VendorOrderPDF: React.FC<VendorOrderPDFProps> = ({ order, vendorId }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [deliveryCode, setDeliveryCode] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePDF = async () => {
    const tab = window.open('', '_blank');
    setIsGenerating(true);
    try {
      // Generate new PDF
      const response = await supabase.functions.invoke('generate-order-pdf', {
        body: {
          orderId: order.id,
          vendorId,
          audience: 'vendor',
          force: true,
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { pdfUrl: newPdfUrl, deliveryCode: newDeliveryCode } = response.data;
      setPdfUrl(newPdfUrl);
      setDeliveryCode(newDeliveryCode);
      if (tab) tab.location.href = newPdfUrl;

      toast({ title: 'PDF Generated', description: 'Opening vendor PDF.' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (tab) try { tab.close(); } catch {}
      toast({
        title: "Error",
        description: "Failed to open PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Order Documentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
            <p className="font-medium">{order.title}</p>
          </div>
          <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'}>
            {order.status}
          </Badge>
        </div>

        {deliveryCode && (
          <div className="bg-accent p-3 rounded-lg">
            <p className="text-sm font-medium">Delivery Confirmation Code</p>
            <p className="text-lg font-mono font-bold text-primary">{deliveryCode}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Text this code to confirm delivery during the delivery window
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={() => generatePDF()}
            disabled={isGenerating}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Download Order Details & Breakdown'}
          </Button>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This PDF contains complete order details including services, menu items, 
            financial breakdown with your net payout, delivery instructions, confirmation code, 
            and contact information.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};