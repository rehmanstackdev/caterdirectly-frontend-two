
import React from "react";
import Header from "@/components/cater-directly/Header";
import VenueList from "@/components/marketplace/venues/VenueList";
import Footer from "@/components/cater-directly/Footer";
import VenueFilters from "@/components/marketplace/venues/VenueFilters";
import { LocationProvider } from "@/hooks/use-location";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { useUnifiedMarketplace } from "@/hooks/use-unified-marketplace";

const VenuePage = () => {
  const { services: venues, isLoading, error, refreshServices } = useUnifiedMarketplace({
    activeTab: 'venues',
    isTabVisible: true,
    enableSearch: false,
    vendorMode: false
  });

  return (
    <LocationProvider>
      <LoadingProvider>
        <div className="min-h-screen bg-white overflow-x-hidden">
          <Header hideNavigation={true} />
          
          <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8 w-full">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">Find the Perfect Venue</h1>
            <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-8">Browse our selection of premium venues for your next event</p>
            
            <div className="mb-6">
              <AddressAutocomplete 
                placeholder="Filter venues by location" 
                containerClassName="w-full max-w-full px-0"
              />
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
              <div className="w-full md:w-1/4">
                <VenueFilters />
              </div>
              <div className="w-full md:w-3/4">
                <VenueList venues={venues} loading={isLoading} error={error} />
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </LoadingProvider>
    </LocationProvider>
  );
};

export default VenuePage;
