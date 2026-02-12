import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "@/hooks/use-location";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import ServiceUnavailableInArea from "@/components/shared/ServiceUnavailableInArea";
import ServiceCardSkeleton from "@/components/shared/ServiceCardSkeleton";
import { useImagePreloader } from "@/hooks/use-image-preloader";
import { getDisplayCity } from "@/utils/address-utils";
import ServicesService from "@/services/api/services.Service";
import CatererCard from "./CatererCard";

interface TopRatedVenue {
  id: string;
  serviceName: string;
  serviceType: string;
  description: string;
  status: string;
  visibleStatus: string;
  manage: boolean;
  vendor: {
    id: string;
    businessName: string;
    fullAddress: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    reviews?: {
      totalReviews: number;
      averageRating: number;
    };
  };
  venue?: {
    id: string;
    pricingType: string;
    price: string;
    minimumGuests: number;
    maximumGuests: number;
    seatedCapacity: number;
    standingCapacity: number;
    serviceImage?: string;
  };
}

const VenuesSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { address, locationSet } = useLocation();

  const [topRatedVenues, setTopRatedVenues] = useState<TopRatedVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopRatedVenues = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ServicesService.getTopRatedVenues();
      setTopRatedVenues(data as unknown as TopRatedVenue[]);
    } catch (err) {
      console.error('Error fetching top-rated venues:', err);
      setError('Failed to load top-rated venues. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopRatedVenues();
  }, [fetchTopRatedVenues]);

  // Filter to only show approved and active services
  const approvedServices = topRatedVenues.filter(service =>
    service.status === 'approved' && service.visibleStatus === 'active'
  );

  // Preload images for faster rendering
  const { preloadImages } = useImagePreloader();

  useEffect(() => {
    const imageUrls = approvedServices
      .map(service => service.venue?.serviceImage)
      .filter((url): url is string => Boolean(url));

    if (imageUrls.length > 0) {
      preloadImages(imageUrls, { timeout: 3000 });
    }
  }, [approvedServices, preloadImages]);

  // Display services
  const visibleCount = isMobile ? 4 : 6;
  const displayServices = approvedServices.slice(0, visibleCount);
  const hasServices = displayServices.length > 0;

  // For skeleton loading during initial render
  const skeletonCount = isMobile ? 4 : 6;
  const skeletons = Array(skeletonCount).fill(0).map((_, index) => (
    <ServiceCardSkeleton key={`venue-skeleton-${index}`} variant="venue" />
  ));

  // Helper function to format price from API response
  const formatPrice = (service: TopRatedVenue): string => {
    const venue = service.venue;
    if (venue?.price) {
      const price = parseFloat(venue.price);
      if (venue.pricingType === 'hourly_rate') {
        return `$${price.toFixed(2)}/hr`;
      } else if (venue.pricingType === 'per_person') {
        return `$${price.toFixed(2)}/person`;
      } else {
        return `From $${price.toFixed(2)}`;
      }
    }
    return "Contact for pricing";
  };

  // Helper function to get rating from API response
  const getRating = (service: TopRatedVenue): string => {
    return service.vendor?.reviews?.averageRating?.toString() || "0.0";
  };

  // Helper function to get image from API response
  const getImage = (service: TopRatedVenue): string => {
    return service.venue?.serviceImage || "";
  };

  // Helper function to get location from API response
  const getLocation = (service: TopRatedVenue): string => {
    return service.vendor?.fullAddress || "";
  };


  if (isLoading) {
    return (
      <section id="venues" className="flex flex-col items-center px-4 md:px-6 max-w-[1800px] mx-auto py-12 md:py-20 lg:py-24 overflow-x-hidden">
        <div className="text-[rgba(240,119,18,1)] text-sm font-semibold text-center mt-8 md:mt-16">
          Venues
        </div>
        <h2 className="text-[#333] text-center text-3xl md:text-4xl lg:text-[55px] font-bold leading-tight leading-[1.2] md:leading-[1.3] lg:leading-[1.4] mt-4 max-w-[871px] px-2">
          Top-Rated Venues
        </h2>
        <div className="w-full max-w-[1440px] mt-8 md:mt-12 lg:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {skeletons}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="venues" className="flex flex-col items-center px-4 md:px-6 max-w-[1800px] mx-auto py-12 md:py-20 lg:py-24 overflow-x-hidden">
        <div className="text-[rgba(240,119,18,1)] text-sm font-semibold text-center mt-8 md:mt-16">
          Venues
        </div>
        <h2 className="text-[#333] text-center text-3xl md:text-4xl lg:text-[55px] font-bold leading-tight leading-[1.2] md:leading-[1.3] lg:leading-[1.4] mt-4 max-w-[871px] px-2">
          Top-Rated Venues
        </h2>
        <div className="p-6 bg-red-50 rounded-lg text-center mt-12 w-full max-w-md">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={fetchTopRatedVenues}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section id="venues" className="flex flex-col items-center px-4 md:px-6 max-w-[1800px] mx-auto py-12 md:py-20 lg:py-24 overflow-x-hidden">
        <div className="text-[rgba(240,119,18,1)] text-sm font-semibold text-center mt-8 md:mt-16">
          Venues
        </div>
        <h2 className="text-[#333] text-center text-3xl md:text-4xl lg:text-[55px] font-bold leading-tight leading-[1.2] md:leading-[1.3] lg:leading-[1.4] mt-4 max-w-[871px] px-2">
          {locationSet && getDisplayCity(address) ? `Top Venues in ${getDisplayCity(address)}` : "Top-Rated Venues"}
        </h2>

        <div className="w-full max-w-[1440px] mt-8 md:mt-12 lg:mt-16">
          {!hasServices && (
            <ServiceUnavailableInArea 
              serviceType="venue" 
              address={address || ""}
            />
          )}
          {hasServices && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayServices.map((service) => {
                return (
                  <div key={service.id} className="transition-all duration-300 opacity-100">
                    <CatererCard
                      id={service.id}
                      image={getImage(service)}
                      name={service.serviceName}
                      rating={getRating(service)}
                      price={formatPrice(service)}
                      location={getLocation(service)}
                      description={service.description}
                      buttonText="View More"
                      isManaged={service.manage}
                      activeTab="venues"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button 
          onClick={() => navigate('/marketplace?category=venues')}
          className="mt-8 md:mt-10 lg:mt-16 bg-[#F07712] hover:bg-[#F07712]/90 text-white rounded-full px-5 md:px-6 py-2.5 md:py-3 flex items-center gap-2"
        >
          <span className="text-base md:text-xl font-medium">See More Venues</span>
          <div className="bg-white rounded-full p-1 md:p-1.5 flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
            <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#F07712]" />
          </div>
        </Button>
      </section>
    </ErrorBoundary>
  );
};

export default VenuesSection;
