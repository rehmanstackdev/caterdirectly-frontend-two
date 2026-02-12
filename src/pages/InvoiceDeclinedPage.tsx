import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/cater-directly/Header";
import Footer from "@/components/cater-directly/Footer";

const InvoiceDeclinedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex items-center justify-center">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mb-8">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Proposal Declined</h1>
          <p className="text-gray-600 mb-6">
            You have successfully declined this proposal.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">What's next?</h3>
            <p className="text-gray-600 text-sm">
              If you change your mind or would like to discuss alternative options, please contact the vendor directly or browse our marketplace for other options.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/marketplace')}
              className="bg-[#F07712] hover:bg-[#F07712]/90 w-full"
            >
              Browse Marketplace
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
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

export default InvoiceDeclinedPage;

