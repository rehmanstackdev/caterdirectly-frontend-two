
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, CircleCheck, MapPin, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import AIServiceCard from "./AIServiceCard";

interface ProposalService {
  id: string;
  name: string;
  image: string;
  vendorName: string;
  price: string;
  description: string;
  type: string;
}

interface AIEventProposalProps {
  proposal: {
    message: string;
    services: {
      catering?: ProposalService[];
      venue?: ProposalService[];
      staff?: ProposalService[];
      rentals?: ProposalService[];
    };
    totalBudget: string;
    budgetBreakdown: {
      [key: string]: {
        amount: string;
        percentage: string;
      };
    };
    eventSummary: string;
    location: string;
    hasServicesAvailable: boolean;
  };
  clientName: string;
  onBack: () => void;
}

const AIEventProposal = ({ proposal, clientName, onBack }: AIEventProposalProps) => {
  const isMobile = useIsMobile();
  
  // Count total services
  const serviceCount = 
    (proposal.services.catering?.length || 0) +
    (proposal.services.venue?.length || 0) +
    (proposal.services.staff?.length || 0) +
    (proposal.services.rentals?.length || 0);
  
  const noServicesAvailable = serviceCount === 0 || !proposal.hasServicesAvailable;
    
  return (
    <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-[#F07712]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full flex items-center">
          <CircleCheck className="h-4 w-4 mr-1.5" />
          <span className="text-sm font-medium">Proposal Ready</span>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Hello, {clientName}
        </h3>
        <p className="text-gray-700 text-base md:text-lg">
          {proposal.message}
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-gray-900">Your Event Summary</h4>
          <div className="text-[#F07712] font-medium">Total: {proposal.totalBudget}</div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700">{proposal.eventSummary}</p>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(proposal.budgetBreakdown).map(([category, details]) => (
              <div key={category} className="bg-white p-3 rounded-md shadow-sm">
                <div className="text-sm text-gray-500 capitalize mb-1">{category}</div>
                <div className="font-semibold">{details.amount}</div>
                <div className="text-xs text-gray-500">{details.percentage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {noServicesAvailable ? (
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 text-center my-12">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Services Coming Soon to {proposal.location}
          </h3>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            We're currently expanding our network of trusted vendors in your area. 
            Sign up for notifications to be the first to know when services become available in {proposal.location}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-[#F07712] hover:bg-[#F07712]/90 text-white"
              onClick={() => window.location.href = '/notify-me'}
            >
              Get Notified
            </Button>
            <Button
              variant="outline"
              className="border-[#F07712] text-[#F07712]"
              onClick={() => window.location.href = '/marketplace'}
            >
              Browse All Regions
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {proposal.services.venue && proposal.services.venue.length > 0 && (
            <ServiceSection 
              title="Venue Recommendation" 
              services={proposal.services.venue} 
              type="venue" 
            />
          )}
          
          {proposal.services.catering && proposal.services.catering.length > 0 && (
            <ServiceSection 
              title="Catering Selection" 
              services={proposal.services.catering} 
              type="catering" 
            />
          )}
          
          {proposal.services.staff && proposal.services.staff.length > 0 && (
            <ServiceSection 
              title="Event Staff" 
              services={proposal.services.staff} 
              type="staff" 
            />
          )}
          
          {proposal.services.rentals && proposal.services.rentals.length > 0 && (
            <ServiceSection 
              title="Event Rentals" 
              services={proposal.services.rentals} 
              type="rentals" 
            />
          )}
        </div>
      )}
      
      <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full md:w-auto"
        >
          Refine My Options
        </Button>
        
        <Button 
          className="w-full md:w-auto bg-[#F07712] hover:bg-[#F07712]/90 text-white"
          onClick={() => window.location.href = '/marketplace'}
        >
          Explore Services
        </Button>
      </div>
    </div>
  );
};

// Helper component for service sections
const ServiceSection = ({ title, services, type }: { title: string, services: ProposalService[], type: string }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <AIServiceCard 
            key={service.id} 
            service={service}
            serviceType={type}
          />
        ))}
      </div>
    </div>
  );
};

export default AIEventProposal;
