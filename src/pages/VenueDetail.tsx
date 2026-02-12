
import React from "react";
import { useParams } from "react-router-dom";
import MetaTags from "@/components/shared/MetaTags";
import { useServices } from "@/hooks/use-services";

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { services } = useServices();
  
  // Find the venue based on the id parameter
  const venue = services.find(service => service.id === id && service.type === 'venues');
  
  // Set meta tags based on the venue details
  const venueTitle = venue ? `${venue.name} - CaterDirectly Venue` : "Venue Details - CaterDirectly";
  const venueDescription = venue ? 
    `Explore ${venue.name}, a premium venue available for booking through CaterDirectly.` : 
    "Explore our premium venues available for booking through CaterDirectly.";
  const venueImage = venue?.image || "/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png";
  
  return (
    <>
      <MetaTags
        title={venueTitle}
        description={venueDescription}
        image={venueImage}
        type="business.business"
      />
      {/* Rest of VenueDetail component */}
    </>
  );
};

export default VenueDetail;
