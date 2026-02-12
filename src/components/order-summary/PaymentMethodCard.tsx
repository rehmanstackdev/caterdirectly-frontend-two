
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StripePaymentForm from "./StripePaymentForm";
import StripeProvider from "./StripeProvider";

interface PaymentMethodCardProps {
  totalAmount: number;
  additionalTip?: number;
  onPaymentSuccess: (orderId: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
  orderData: any;
  services: any[];
  selectedItems: Record<string, number>;
  onBillingAddressChange?: (address: string | null) => void;
  onStripeTaxUpdate?: (tax: { amount: number; rate?: number; breakdown?: any; jurisdiction?: any } | null) => void;
  preTaxBreakdown?: { subtotal: number; serviceFee: number; deliveryFee: number; adjustmentsTotal?: number; tax?: number; taxRate?: number; currency?: string };
  clientSecret?: string; // Payment Intent client secret from API
  paymentIntentId?: string; // Payment Intent ID from API
  invoiceId?: string; // Invoice ID for invoice payments
  proposal?: any; // Optional proposal object for proposal payments
}

const PaymentMethodCard = ({
  totalAmount,
  additionalTip = 0,
  onPaymentSuccess,
  isProcessing,
  disabled = false,
  orderData,
  services,
  selectedItems,
  onBillingAddressChange,
  onStripeTaxUpdate,
  preTaxBreakdown,
  clientSecret,
  paymentIntentId,
  invoiceId,
  proposal
}: PaymentMethodCardProps) => {
  const amountInCents = Math.round(totalAmount * 100);
  
  console.log('[PaymentMethodCard] totalAmount:', totalAmount, 'amountInCents:', amountInCents);
  
  // Don't render Stripe Elements until we have a valid amount
  if (!totalAmount || totalAmount <= 0) {
    // For proposals, show a different message since tax calculation doesn't apply
    if (proposal) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-lg font-medium">Processing proposal...</div>
            <div className="text-sm text-gray-500 mt-1">Preparing your proposal for payment</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium">Calculating total...</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we calculate your order total</div>
        </div>
      </div>
    );
  }
  
  return (
    <StripeProvider amount={amountInCents} clientSecret={clientSecret}>
      <StripePaymentForm
        totalAmount={totalAmount}
        additionalTip={additionalTip}
        onPaymentSuccess={onPaymentSuccess}
        isProcessing={isProcessing}
        disabled={disabled}
        orderData={orderData}
        services={services}
        selectedItems={selectedItems}
        onBillingAddressChange={onBillingAddressChange}
        onStripeTaxUpdate={onStripeTaxUpdate}
        preTaxBreakdown={preTaxBreakdown}
        clientSecret={clientSecret}
        paymentIntentId={paymentIntentId}
        invoiceId={invoiceId}
        proposal={proposal}
      />
    </StripeProvider>
  );
};

export default PaymentMethodCard;
