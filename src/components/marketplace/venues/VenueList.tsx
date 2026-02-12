

import { VendorCard } from '@/components/marketplace/vendor-card';
import { ServiceItem } from '@/types/service-types';
import ServiceUnavailableInArea from '@/components/shared/ServiceUnavailableInArea';
import ServiceCardSkeleton from '@/components/shared/ServiceCardSkeleton';
import { useLocation } from '@/hooks/use-location';
import { SERVICE_GRID_TEMPLATE } from '@/components/shared/grid';

interface VenueListProps {
  venues: ServiceItem[];
  loading: boolean;
  error: string | null;
}

const VenueList = ({ venues, loading, error }: VenueListProps) => {
  const { address, locationSet } = useLocation();

  if (loading) {
    return (
      <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <ServiceCardSkeleton key={`venue-skeleton-${index}`} variant="venue" />
          ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }
  
  // Update service type comparison
  const displayVenues = venues.filter(venue => 
    venue.type === 'venues' && venue.status === 'approved' && venue.active !== false
  );

  if (!displayVenues.length) {
    return (
      <ServiceUnavailableInArea 
        serviceType="venue" 
        address={address}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
      {displayVenues.map((venue) => (
        <VendorCard
          key={venue.id}
          id={venue.id}
          image={venue.image}
          name={venue.name}
          vendorName={venue.vendorName}
          rating={venue.rating || "0.0"}
          reviews={venue.reviews || "0"}
          location={venue.location}
          price={venue.price}
          description={venue.description || ""}
          available={venue.active !== false}
          vendorType="venue"
          isManaged={venue.isManaged}
        />
      ))}
    </div>
  );
};

export default VenueList;
