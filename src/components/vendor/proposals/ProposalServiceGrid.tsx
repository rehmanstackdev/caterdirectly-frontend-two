import React, { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { ServiceItem } from '@/types/service-types';
import { Invoice } from '@/types/invoice-types';
import ServiceCard from '@/components/marketplace/service-card/ServiceCard';
import { supabase } from '@/integrations/supabase/client';
import { transformServiceData } from '@/hooks/services/crud/use-transform-service';
import { useServiceDetails } from '@/hooks/use-service-details';
import ServiceDetailsContainer from '@/components/marketplace/details/ServiceDetailsContainer';
import { SERVICE_GRID_TEMPLATE } from '@/components/shared/grid';

interface ProposalServiceGridProps {
  proposal: Invoice;
  onServiceSelect: (service: ServiceItem) => void;
}

export const ProposalServiceGrid: React.FC<ProposalServiceGridProps> = ({
  proposal,
  onServiceSelect
}) => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use the marketplace service details functionality
  const {
    selectedService,
    handleOpenDetails,
    handleCloseDetails,
    handleBookService: originalHandleBookService
  } = useServiceDetails();

  // Force logging to see what's happening
  console.log('[ProposalServiceGrid] Component rendered with:', {
    userExists: !!user,
    servicesCount: services?.length || 0,
    loading,
    timestamp: new Date().toISOString()
  });

  // Fetch ALL approved services for proposals (not just vendor's own services)
  useEffect(() => {
    const fetchAllApprovedServices = async () => {
      try {
        setLoading(true);
        console.log('[ProposalServiceGrid] Fetching all approved services...');
        
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('status', 'approved')
          .eq('active', true);

        if (error) {
          console.error('[ProposalServiceGrid] Error fetching services:', error);
          throw error;
        }

        console.log('[ProposalServiceGrid] Raw services from DB:', data?.length || 0);

        // Transform data to match our ServiceItem interface
        const transformedServices: ServiceItem[] = data?.map(service => {
          const transformed = transformServiceData(service);
          console.log('[ProposalServiceGrid] Transformed service:', {
            id: transformed.id,
            name: transformed.name,
            image: transformed.image,
            hasServiceDetails: !!transformed.service_details
          });
          return transformed;
        }) || [];

        setServices(transformedServices);
      } catch (error: any) {
        console.error('[ProposalServiceGrid] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllApprovedServices();
  }, []);

  // Handle viewing details (opens service details dialog)
  const handleViewDetails = (service: ServiceItem) => {
    handleOpenDetails(service);
  };
  
  // Handle service selection from the dialog (proposal mode)
  const handleProposalBookService = () => {
    if (selectedService) {
      onServiceSelect(selectedService);
      handleCloseDetails();
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No active services available for proposals.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
        {services.map(service => {
          const isSelected = proposal.items.some(item => item.serviceId === service.id);
          
          return (
            <div key={service.id} className={`transition-all ${isSelected ? 'ring-2 ring-[#F07712] rounded-lg' : ''}`}>
              <ServiceCard
                service={service}
                onViewDetails={() => handleViewDetails(service)}
                vendorType={service.type}
                priority={false}
                existingServices={[]}
              />
              {isSelected && (
                <div className="text-center mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#F07712] text-white">
                    Added to Proposal
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Service Details Dialog - works exactly like marketplace */}
      <ServiceDetailsContainer
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseDetails}
        onBookService={handleProposalBookService}
      />
    </>
  );
};