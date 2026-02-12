import { useEffect, useState, useCallback } from "react";
import CatererCard from "./CatererCard";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "@/hooks/use-location";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import ServiceCardSkeleton from "@/components/shared/ServiceCardSkeleton";
import { useImagePreloader } from "@/hooks/use-image-preloader";
import { getDisplayCity } from "@/utils/address-utils";
import ServicesService from "@/services/api/services.Service";

interface TopRatedCaterer {
  id: string;
  serviceName: string;
  serviceType: string;
  description: string;
  status: string;
  visibleStatus: string;
  manage: boolean;
  isFavourite: boolean;
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
  catering?: {
    menuPhoto?: string;
    minimumOrderAmount?: string;
    menuItems?: Array<{
      id: string;
      name: string;
      price: string;
      imageUrl?: string;
    }>;
  };
}

const CaterersSection = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { address, locationSet } = useLocation();

  const [topRatedCaterers, setTopRatedCaterers] = useState<TopRatedCaterer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopRatedCaterers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ServicesService.getTopRatedCatering();
      setTopRatedCaterers(data as unknown as TopRatedCaterer[]);
    } catch (err) {
      console.error('Error fetching top-rated caterers:', err);
      setError('Failed to load top-rated caterers. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopRatedCaterers();
  }, [fetchTopRatedCaterers]);

  // Filter to only show approved and active services
  const approvedServices = topRatedCaterers.filter(service =>
    service.status === 'approved' && service.visibleStatus === 'active'
  );

  // Preload images for faster rendering
  const { preloadImages } = useImagePreloader();

  useEffect(() => {
    const imageUrls = approvedServices
      .map(service => service.catering?.menuPhoto)
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
    <ServiceCardSkeleton key={`caterer-skeleton-${index}`} variant="caterer" />
  ));

  // Helper function to format price from API response
  const formatPrice = (service: TopRatedCaterer): string => {
    const minOrder = service.catering?.minimumOrderAmount;
    if (minOrder) {
      return `From $${parseFloat(minOrder).toFixed(2)}`;
    }
    return "Contact for pricing";
  };

  // Helper function to get rating from API response
  const getRating = (service: TopRatedCaterer): string => {
    return service.vendor?.reviews?.averageRating?.toString() || "0.0";
  };

  // Helper function to get image from API response
  const getImage = (service: TopRatedCaterer): string => {
    return service.catering?.menuPhoto ||
           service.catering?.menuItems?.[0]?.imageUrl ||
           "";
  };

  // Helper function to get location from API response
  const getLocation = (service: TopRatedCaterer): string => {
    return service.vendor?.fullAddress || "";
  };

  if (isLoading) {
    return (
      <section id="caterers" className="flex flex-col items-center px-4 md:px-6 w-full max-w-full pt-8 md:pt-12 lg:pt-16 pb-12 md:pb-20 lg:pb-24">
        <div className="text-[#F07712] text-sm font-semibold text-center mt-4">
          Catering
        </div>
        <h2 className="text-[#363636] text-3xl md:text-4xl lg:text-5xl font-semibold text-center mt-4 max-w-3xl leading-[1.2] md:leading-[1.3] lg:leading-[1.4]">
          Meet Our Top-Rated Caterers
        </h2>
        <div className="w-full max-w-[1440px] mt-12 md:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {skeletons}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="caterers" className="flex flex-col items-center px-4 md:px-6 w-full max-w-full pt-8 md:pt-12 lg:pt-16 pb-12 md:pb-20 lg:pb-24">
        <div className="text-[#F07712] text-sm font-semibold text-center mt-4">
          Catering
        </div>
        <h2 className="text-[#363636] text-3xl md:text-4xl lg:text-5xl font-semibold text-center mt-4 max-w-3xl leading-[1.2] md:leading-[1.3] lg:leading-[1.4]">
          Meet Our Top-Rated Caterers
        </h2>
        <div className="p-6 bg-red-50 rounded-lg text-center mt-12 w-full max-w-md">
          <p className="text-red-600">{error}</p>
          <Button
            onClick={fetchTopRatedCaterers}
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
      <section id="caterers" className="flex flex-col items-center px-4 md:px-6 w-full max-w-full pt-8 md:pt-12 lg:pt-16 pb-12 md:pb-20 lg:pb-24">
        <div className="text-[#F07712] text-sm font-semibold text-center mt-4">
          Catering
        </div>
        <h2 className="text-[#363636] text-3xl md:text-4xl lg:text-5xl font-semibold text-center mt-4 max-w-3xl leading-[1.2] md:leading-[1.3] lg:leading-[1.4]">
          {locationSet && getDisplayCity(address) ? `Top Caterers in ${getDisplayCity(address)}` : "Top-Rated Caterers"}
        </h2>

        <div className="w-full max-w-[1440px] mt-12 md:mt-16">
          {!hasServices && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">No caterers available at the moment. Check back soon!</p>
            </div>
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
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Button
          onClick={() => navigate('/marketplace?category=catering')}
          className="mt-10 md:mt-16 bg-[#F07712] hover:bg-[#F07712]/90 text-white rounded-full px-6 py-3 flex items-center gap-2"
        >
          <span className="text-base md:text-xl font-medium">See More Caterers</span>
          <div className="bg-white rounded-full p-2 flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-[#F07712]" />
          </div>
        </Button>
      </section>
    </ErrorBoundary>
  );
};

export default CaterersSection;
