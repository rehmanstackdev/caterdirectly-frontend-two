import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/order-summary/StripePaymentForm';
import StripeProvider from '@/components/order-summary/StripeProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Invoice } from '@/types/invoice-types';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';

interface ProposalPaymentFormProps {
  proposal: Invoice;
  onCancel?: () => void;
}

const ProposalPaymentForm = ({
  proposal,
  onCancel
}: ProposalPaymentFormProps) => {
  const { isProcessing } = useInvoicePayment();

  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePaymentSuccess = async (orderId: string) => {
    console.log('[ProposalPayment] Payment successful, order:', orderId);
    setPaymentError(null);
  };

  // Create mock data for the new interface requirements
  const proposalOrderData = {
    orderName: proposal.title || 'Proposal Order',
    location: 'TBD', // This would come from proposal data
    date: proposal.serviceDate || '',
    deliveryWindow: proposal.serviceTime || '',
    headcount: 0, // This would come from proposal data
    primaryContactName: proposal.clientName || '',
    primaryContactPhone: proposal.clientPhone || '',
    primaryContactEmail: proposal.clientEmail || '',
    hasBackupContact: false,
    backupContactName: '',
    backupContactPhone: '',
    backupContactEmail: '',
    additionalNotes: proposal.message || ''
  };

  const proposalServices = Array.isArray(proposal.items) ? proposal.items : [];
  const proposalSelectedItems = Array.isArray(proposal.items) 
    ? proposal.items.reduce((acc, item) => {
        if ((item as any).selected_items && typeof (item as any).selected_items === 'object') {
          Object.assign(acc, (item as any).selected_items);
        }
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment failed: {paymentError}
            <br />
            If your card was charged, please contact support with Proposal ID: {proposal.id}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Complete Your Payment</CardTitle>
          <p className="text-center text-muted-foreground">
            You're about to accept and pay for: {proposal.title}
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-[#F07712]">
                ${proposal.total.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <StripeProvider amount={Math.round(proposal.total * 100)}>
        <StripePaymentForm
          totalAmount={proposal.total}
          onPaymentSuccess={handlePaymentSuccess}
          isProcessing={isProcessing}
          orderData={proposalOrderData}
          services={proposalServices}
          selectedItems={proposalSelectedItems}
          proposal={proposal}
        />
      </StripeProvider>

      {onCancel && (
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 underline"
            disabled={isProcessing}
          >
            Cancel and go back
          </button>
        </div>
      )}
    </div>
  );
};

export default ProposalPaymentForm;