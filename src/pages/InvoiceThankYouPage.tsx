
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/cater-directly/Header";
import Footer from "@/components/cater-directly/Footer";
import Confetti from "react-confetti";

const InvoiceThankYouPage = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Handle window resize for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', updateWindowSize);
      clearTimeout(confettiTimer);
    };
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Thank You for Your Payment!</h1>
        <p className="text-gray-600 mb-6">
          Your payment has been processed successfully. The vendor has been notified and will be in touch regarding your order.
        </p>
        
        {/* <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-2">What's next?</h3>
          <p className="text-gray-600 text-sm">
            You will receive an email confirmation with your order details, and t he vendor will contact you to coordinate services.
          </p>
        </div> */}
        
        <div>
          <Button 
            onClick={() => navigate('/')}
            className="bg-[#F07712] hover:bg-[#F07712]/90 w-full"
          >
            Return to Homepage
          </Button>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default InvoiceThankYouPage;
