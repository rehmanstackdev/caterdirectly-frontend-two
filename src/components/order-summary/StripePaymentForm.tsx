
import React, { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CreditCard, Lock, Shield, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOrderSubmission } from '@/hooks/use-order-submission';
import { useInvoicePayment } from '@/hooks/use-invoice-payment';
import { useAuth } from '@/contexts/auth';
import { LoadingButton } from '@/components/ui/loading-button';
import { usePaymentRetry } from '@/hooks/use-payment-retry';
import { toast } from 'sonner';
import invoiceService from '@/services/api/invoice.Service';

interface StripePaymentFormProps {
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

const StripePaymentForm = ({
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
  proposal,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { processInvoicePayment, isProcessing: isProcessingProposal } = useInvoicePayment();
  const { submitIndividualOrder, isSubmitting } = useOrderSubmission();
  const { user } = useAuth();
  
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
  
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [paymentTimeout, setPaymentTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isClickProcessing, setIsClickProcessing] = useState(false);
  const [isInvoiceAlreadyPaid, setIsInvoiceAlreadyPaid] = useState(false);

  // Payment retry functionality
  const { 
    attemptPayment, 
    retryPayment, 
    resetRetry, 
    retryCount, 
    isRetrying, 
    lastError, 
    canRetry,
    getErrorMessage 
  } = usePaymentRetry({
    maxRetries: 3,
    retryDelayMs: 2000,
    onSuccess: (result) => {
      toast.success('Payment processed successfully!');
      if (result?.id) {
        onPaymentSuccess(result.id);
      }
    },
    onFinalFailure: (error) => {
      setCardError(getErrorMessage(error));
    }
  });

  // Card element styling to match app design
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'hsl(var(--foreground))',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
        iconColor: 'hsl(var(--muted-foreground))',
      },
      invalid: {
        color: 'hsl(var(--destructive))',
        iconColor: 'hsl(var(--destructive))',
      },
    },
    hidePostalCode: true, // We'll collect this separately
  };

  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

/* using Stripe Elements for inputs; manual handler removed */

// Validate form completeness using Stripe Elements
useEffect(() => {
  const formComplete = Boolean(firstName && lastName && cardComplete);
  setFormValid(formComplete && !cardError);
}, [firstName, lastName, cardComplete, cardError]);

// Notify parent when billing address changes (using event location if available)
useEffect(() => {
  if (typeof onBillingAddressChange === 'function') {
    const eventLocation = orderData?.location;
    if (eventLocation) {
      onBillingAddressChange(eventLocation);
    } else {
      onBillingAddressChange(null);
    }
  }
}, [orderData?.location, onBillingAddressChange]);

  const handleProcessPayment = async () => {
    // IMMEDIATE guard - prevent double clicks
    if (isClickProcessing || isInvoiceAlreadyPaid) {
      return;
    }

    setIsClickProcessing(true); // Set IMMEDIATELY before any async work

    try {
      // if (!stripe || !elements || (!user && !proposal)) {
      //   toast.error('Unable to process payment. Please refresh and try again.');
      //   return;
      // }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;

      // Reset any previous errors
      setCardError(null);
      resetRetry();

      // Set payment timeout (30 seconds)
      const timeout = setTimeout(() => {
        setCardError('Payment timed out. Please try again.');
        toast.error('Payment processing timed out');
      }, 30000);
      setPaymentTimeout(timeout);

      try {
      await attemptPayment(async () => {
        // NEW FLOW: If we have clientSecret (invoice payment), use confirmCardPayment
        if (clientSecret && invoiceId && paymentIntentId) {
          // STEP 1: Update payment intent with frontend-calculated amount + additional tip
          let updatedClientSecret = clientSecret;
          const finalAmount = totalAmount + (additionalTip || 0);
          try {
            const updateResponse = await invoiceService.updatePaymentIntentAmount(invoiceId, {
              paymentIntentId: paymentIntentId,
              amount: finalAmount, // Use frontend-calculated total + additional tip
            });
            
            if (updateResponse?.data?.clientSecret) {
              updatedClientSecret = updateResponse.data.clientSecret;
              console.log('[StripePaymentForm] Payment intent updated with amount:', finalAmount, '(base:', totalAmount, '+ tip:', additionalTip || 0, ')');
            }
          } catch (updateError: any) {
            console.error('[StripePaymentForm] Failed to update payment intent amount:', updateError);
            
            // Check if invoice is already marked as paid (403 error)
            if (updateError?.response?.status === 403) {
              const errorMessage = updateError?.response?.data?.message || updateError?.response?.data?.response || 'Invoice is already marked as paid';
              if (!isInvoiceAlreadyPaid) {
                setIsInvoiceAlreadyPaid(true);
                toast.error('Invoice Already Paid', {
                  description: errorMessage
                });
                setCardError(errorMessage);
              }
              throw new Error(errorMessage);
            }
            
            // Continue with original clientSecret if update fails for other reasons
            toast.warning('Could not update payment amount. Using original amount.');
          }

          // STEP 2: Confirm payment using updated clientSecret
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(updatedClientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${firstName} ${lastName}`.trim(),
              },
            },
          });

          if (confirmError) {
            throw new Error(confirmError.message || 'Payment confirmation failed');
          }

          if (!paymentIntent) {
            throw new Error('Payment confirmation failed - no payment intent returned');
          }

          // Check if payment succeeded
          if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Payment status is ${paymentIntent.status}. Payment must succeed to complete.`);
          }

          // Mark invoice as paid on backend
          try {
            await invoiceService.markAsPaidStripe(invoiceId, {
              paymentIntentId: paymentIntent.id,
              additionalTip: additionalTip || undefined,
            });
          } catch (markPaidError: any) {
            console.error('[StripePaymentForm] Failed to mark invoice as paid:', markPaidError);
            
            // Check if invoice is already marked as paid (403 error)
            if (markPaidError?.response?.status === 403) {
              const errorMessage = markPaidError?.response?.data?.message || markPaidError?.response?.data?.response || 'Invoice is already marked as paid';
              if (!isInvoiceAlreadyPaid) {
                setIsInvoiceAlreadyPaid(true);
                toast.error('Invoice Already Paid', {
                  description: errorMessage
                });
                setCardError(errorMessage);
              }
              // Throw error to prevent navigation to confirm screen
              throw new Error(errorMessage);
            }
            
            // For other errors, show warning but don't block navigation
            toast.error('Payment succeeded but failed to update invoice status. Please contact support.');
          }

          // Call success handler with invoice ID
          onPaymentSuccess(invoiceId);
          
          return { id: invoiceId, orderId: invoiceId };
        }

        // OLD FLOW: Regular order payment (no clientSecret)
        // First create payment method
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: `${firstName} ${lastName}`.trim(),
          },
        });

        if (error) {
          throw new Error(error.message || 'An error occurred while processing your payment method');
        }

        if (!paymentMethod) {
          throw new Error('Failed to create payment method');
        }

        // Use event location for address if available
        const eventLocation = orderData?.location;
        const billingAddress = eventLocation ? {
          line1: eventLocation,
          line2: undefined,
          city: '',
          state: '',
          postal_code: '',
          country: 'US',
        } : {
          line1: '',
          line2: undefined,
          city: '',
          state: '',
          postal_code: '',
          country: 'US',
        };

        const result = proposal 
          ? await processInvoicePayment(proposal, paymentMethod.id)
          : await submitIndividualOrder(
              orderData,
              services,
              selectedItems,
              paymentMethod.id,
              billingAddress,
              totalAmount,
              preTaxBreakdown ? {
                subtotal: preTaxBreakdown.subtotal,
                serviceFee: preTaxBreakdown.serviceFee,
                deliveryFee: preTaxBreakdown.deliveryFee,
                adjustmentsTotal: preTaxBreakdown.adjustmentsTotal || 0,
                tax: totalAmount - (preTaxBreakdown.subtotal + preTaxBreakdown.serviceFee + preTaxBreakdown.deliveryFee + (preTaxBreakdown.adjustmentsTotal || 0)),
                total: totalAmount,
                customAdjustments: orderData.customAdjustments || [],
                createdAt: new Date().toISOString()
              } : undefined
            );

        return result;
      });
      } catch (error: any) {
        // If invoice is already paid, don't retry
        if (error?.message?.includes('already marked as paid') || error?.message?.includes('Invoice is already marked as paid')) {
          // Error already handled above, just prevent retries
          return;
        }
        // Error handling is done by the retry hook
      } finally {
        // Clear timeout
        if (timeout) {
          clearTimeout(timeout);
          setPaymentTimeout(null);
        }
      }
    } finally {
      // Reset guard after payment completes (success or failure)
      setIsClickProcessing(false);
    }
  };

  // Handle manual retry
  const handleRetryPayment = async () => {
    if (!stripe || !elements) return;
    
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    await retryPayment(async () => {
      // NEW FLOW: If we have clientSecret (invoice payment), use confirmCardPayment
      if (clientSecret && invoiceId && paymentIntentId) {
        // STEP 1: Update payment intent with frontend-calculated amount + additional tip
        let updatedClientSecret = clientSecret;
        const finalAmount = totalAmount + (additionalTip || 0);
        try {
          const updateResponse = await invoiceService.updatePaymentIntentAmount(invoiceId, {
            paymentIntentId: paymentIntentId,
            amount: finalAmount, // Use frontend-calculated total + additional tip
          });
          
          if (updateResponse?.data?.clientSecret) {
            updatedClientSecret = updateResponse.data.clientSecret;
            console.log('[StripePaymentForm] Payment intent updated with amount (retry):', finalAmount, '(base:', totalAmount, '+ tip:', additionalTip || 0, ')');
          }
        } catch (updateError: any) {
          console.error('[StripePaymentForm] Failed to update payment intent amount (retry):', updateError);
          
          // Check if invoice is already marked as paid (403 error)
          if (updateError?.response?.status === 403) {
            const errorMessage = updateError?.response?.data?.message || updateError?.response?.data?.response || 'Invoice is already marked as paid';
            if (!isInvoiceAlreadyPaid) {
              setIsInvoiceAlreadyPaid(true);
              toast.error('Invoice Already Paid', {
                description: errorMessage
              });
              setCardError(errorMessage);
            }
            throw new Error(errorMessage);
          }
          
          // Continue with original clientSecret if update fails for other reasons
        }

        // STEP 2: Confirm payment using updated clientSecret
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(updatedClientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${firstName} ${lastName}`.trim(),
            },
          },
        });

        if (confirmError) {
          throw new Error(confirmError.message || 'Payment confirmation failed');
        }

        if (!paymentIntent) {
          throw new Error('Payment confirmation failed - no payment intent returned');
        }

        // Check if payment succeeded
        if (paymentIntent.status !== 'succeeded') {
          throw new Error(`Payment status is ${paymentIntent.status}. Payment must succeed to complete.`);
        }

        // Mark invoice as paid on backend
        try {
          await invoiceService.markAsPaidStripe(invoiceId, {
            paymentIntentId: paymentIntent.id,
            additionalTip: additionalTip || undefined,
          });
        } catch (markPaidError: any) {
          console.error('[StripePaymentForm] Failed to mark invoice as paid:', markPaidError);
          
          // Check if invoice is already marked as paid (403 error)
          if (markPaidError?.response?.status === 403) {
            const errorMessage = markPaidError?.response?.data?.message || markPaidError?.response?.data?.response || 'Invoice is already marked as paid';
            if (!isInvoiceAlreadyPaid) {
              setIsInvoiceAlreadyPaid(true);
              toast.error('Invoice Already Paid', {
                description: errorMessage
              });
              setCardError(errorMessage);
            }
            // Don't navigate to confirm screen - stay on order summary
            throw new Error(errorMessage);
          }
          
          // For other errors, show warning but don't block navigation
          toast.error('Payment succeeded but failed to update invoice status. Please contact support.');
        }

        // Call success handler with invoice ID
        onPaymentSuccess(invoiceId);
        
        return { id: invoiceId, orderId: invoiceId };
      }

      // OLD FLOW: Regular order payment (no clientSecret)
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: `${firstName} ${lastName}`.trim(),
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment method creation failed');
      }

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      // Use event location for address if available
      const eventLocation = orderData?.location;
      const billingAddress = eventLocation ? {
        line1: eventLocation,
        line2: undefined,
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      } : {
        line1: '',
        line2: undefined,
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      };

      // Process payment - use proposal payment flow if proposal is present
      return proposal 
        ? await processInvoicePayment(proposal, paymentMethod.id)
        : await submitIndividualOrder(
            orderData,
            services,
            selectedItems,
            paymentMethod.id,
            billingAddress,
            totalAmount + (additionalTip || 0),
            preTaxBreakdown ? {
              subtotal: preTaxBreakdown.subtotal,
              serviceFee: preTaxBreakdown.serviceFee,
              deliveryFee: preTaxBreakdown.deliveryFee,
              adjustmentsTotal: preTaxBreakdown.adjustmentsTotal || 0,
              tax: totalAmount - (preTaxBreakdown.subtotal + preTaxBreakdown.serviceFee + preTaxBreakdown.deliveryFee + (preTaxBreakdown.adjustmentsTotal || 0)),
              total: totalAmount + (additionalTip || 0),
              customAdjustments: orderData.customAdjustments || [],
              createdAt: new Date().toISOString()
            } : undefined
          );
    });
  };


  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (paymentTimeout) {
        clearTimeout(paymentTimeout);
      }
    };
  }, [paymentTimeout]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col space-y-4 sm:space-y-6">
        {/* Security Notice */}
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm min-w-0">
            <span className="font-medium text-blue-900">Secure Payment:</span>{' '}
            <span className="text-blue-700">Your payment is processed securely through Stripe. We never store your card details.</span>
          </div>
        </div>


        {/* Payment Details */}
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm">First Name *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={disabled || isProcessing}
                className="mt-1 min-h-[44px]"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                disabled={disabled || isProcessing}
                className="mt-1 min-h-[44px]"
              />
            </div>
          </div>

          {/* Card Element */}
          <div>
            <Label htmlFor="card-element" className="text-sm">Card Information *</Label>
            <div className="mt-1 p-3 sm:p-4 border border-input rounded-md bg-background min-h-[44px] flex items-center">
              <CardElement
                id="card-element"
                options={cardElementOptions}
                onChange={handleCardChange}
                className="w-full"
              />
            </div>
            {cardError && (
              <Alert className="mt-2" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {cardError}
                  {canRetry && !isInvoiceAlreadyPaid && (
                    <div className="mt-2">
                      <LoadingButton
                        onClick={handleRetryPayment}
                        loading={isRetrying}
                        loadingText="Retrying..."
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Retry Payment ({retryCount}/{3})
                      </LoadingButton>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

        </div>

        {/* SSL Security Notice */}
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground py-2">
          <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>Your payment information is secured with SSL encryption</span>
        </div>

        {/* Payment Button */}
        <LoadingButton
          onClick={handleProcessPayment}
          loading={isProcessing || isSubmitting || isRetrying || isClickProcessing}
          loadingText={isRetrying ? `Retrying Payment... (${retryCount}/3)` : 'Processing Payment...'}
          disabled={!formValid || disabled || !stripe || isClickProcessing || isInvoiceAlreadyPaid}
          className="w-full bg-blue-600 hover:bg-blue-700 min-h-[48px] text-sm sm:text-base mt-auto"
          size="lg"
        >
          {isInvoiceAlreadyPaid ? 'Invoice Already Paid' : `Pay ${(totalAmount + (additionalTip || 0)).toFixed(2)}`}
        </LoadingButton>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
