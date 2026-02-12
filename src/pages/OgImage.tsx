
import React, { useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import MetaTags from "@/components/shared/MetaTags";

const OgImage = () => {
  // Ensure this page has its own metadata
  const imgUrl = "/lovable-uploads/5a0003fb-1412-482d-a6cb-4352fc398d2d.png";
  
  // Force the page to use the proper OG image
  useEffect(() => {
    // Update the canonical URL to be the root domain
    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.origin);
    document.head.appendChild(link);
  }, []);
  
  return (
    <>
      <MetaTags 
        title="CaterDirectly - Event Services Marketplace"
        description="Find the best catering services, venues, party rentals, and staffing for your events"
        image={imgUrl}
      />
      <div className="w-full h-screen flex items-center justify-center bg-[#0A0B34]">
        <img 
          src={imgUrl} 
          alt="Cater Directly Logo" 
          className="max-w-full max-h-full object-contain" 
        />
      </div>
    </>
  );
};

export default OgImage;
