
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/cater-directly/Header";
import Footer from "@/components/cater-directly/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useOrderSubmission } from "@/hooks/use-order-submission";
import { useToast } from "@/components/ui/use-toast";
import Confetti from "react-confetti";
import { generateInvoicePDF } from "@/utils/invoice-pdf-generator";
import invoiceService from "@/services/api/invoice.Service";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { verifyPayment } = useOrderSubmission();
  
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const hasVerifiedRef = useRef(false);
  
  // Get session_id from URL params (Stripe redirect) or orderId from state
  const sessionId = searchParams.get('session_id');
  const orderId = location.state?.orderId;

  // Handle window resize for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  useEffect(() => {
    // Prevent multiple verifications
    if (hasVerifiedRef.current) return;
    
    const handlePaymentVerification = async () => {
      hasVerifiedRef.current = true;
      
      if (sessionId) {
        // This is a redirect from Stripe, verify the payment
        try {
          const result = await verifyPayment(sessionId);
          
          if (result?.success && result.paymentStatus === 'paid') {
            setPaymentStatus('success');
            
            // Download invoice PDF after successful payment
            if (result.invoiceId) {
              try {
                const invoiceResponse = await invoiceService.getInvoiceOrderSummary(result.invoiceId);
                if (invoiceResponse?.data?.invoice) {
                  generateInvoicePDF(invoiceResponse.data.invoice);
                }
              } catch (pdfError) {
                console.error('Failed to generate PDF:', pdfError);
              }
            }
            
            toast({
              title: "Payment Successful!",
              description: "Your order has been confirmed and payment processed. Invoice PDF is downloading.",
            });
          } else {
            setPaymentStatus('failed');
            toast({
              title: "Payment Failed",
              description: "Your payment could not be processed. Please try again.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          setPaymentStatus('failed');
          toast({
            title: "Verification Error",
            description: "Unable to verify payment status. Please contact support.",
            variant: "destructive"
          });
        }
      } else if (orderId) {
        // Direct navigation with order ID (legacy support)
        setPaymentStatus('success');
        
        // Try to download PDF for legacy orders too
        try {
          const invoiceResponse = await invoiceService.getInvoiceOrderSummary(orderId);
          if (invoiceResponse?.data?.invoice) {
            generateInvoicePDF(invoiceResponse.data.invoice);
          }
        } catch (pdfError) {
          console.error('Failed to generate PDF for legacy order:', pdfError);
        }
        
        toast({
          title: "Order Confirmed",
          description: "Your order has been successfully placed. Invoice PDF is downloading.",
        });
      } else {
        // No valid parameters, redirect to marketplace
        navigate('/marketplace');
      }
    };

    handlePaymentVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, orderId]);

  // Continuous confetti loop for successful payments
  useEffect(() => {
    if (paymentStatus !== 'success') return;

    let confettiInterval: ReturnType<typeof setInterval>;
    
    const startConfettiLoop = () => {
      setShowConfetti(true);
      
      // Let confetti run for 10 seconds to ensure all pieces fall off screen
      setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
    };

    // Start immediately
    startConfettiLoop();
    
    // Then repeat every 25 seconds (10s confetti + 15s pause)
    confettiInterval = setInterval(startConfettiLoop, 25000);

    return () => {
      if (confettiInterval) {
        clearInterval(confettiInterval);
      }
    };
  }, [paymentStatus]);

  const handleBackToMarketplace = () => {
    navigate('/marketplace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with dark background */}
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 py-8 px-4">
        {paymentStatus === 'loading' ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we confirm your payment...</p>
            </div>
          </div>
        ) : (
          <>
            {showConfetti && (
              <Confetti
                width={windowSize.width}
                height={windowSize.height}
                recycle={false}
                numberOfPieces={300}
                gravity={0.2}
              />
            )}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  {paymentStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <CardTitle className="text-2xl font-bold text-green-700">
                        Payment Successful!
                      </CardTitle>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <CardTitle className="text-2xl font-bold text-red-700">
                        Payment Failed
                      </CardTitle>
                    </>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {paymentStatus === 'success' ? (
                    <>
                      <div className="text-center">
                        <p className="text-lg mb-2">Thank you for your order!</p>
                        <p className="text-gray-600 mb-4">
                          Your payment has been processed successfully and your order is now confirmed.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-lg mb-2">Payment could not be completed</p>
                        <p className="text-gray-600">
                          Your payment was not processed. No charges have been made to your account.
                          Please try again or contact support if the problem persists.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleBackToMarketplace} className="flex-1">
                          Try Again
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/support')} className="flex-1">
                          Contact Support
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
