
import React, { useEffect } from "react";
import MetaTags from "@/components/shared/MetaTags";

const OgSplash = () => {
  const imgUrl = "/lovable-uploads/ddecb2bc-cb77-4f72-9fbb-29ba51e7ca47.png";
  
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
        title="CaterDirectly - Event Services Splash"
        description="Premium event services marketplace for catering, venues, and staffing"
        image={imgUrl}
      />
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <img 
          src={imgUrl}
          alt="OG Splash Image" 
          className="max-w-full max-h-full object-contain" 
        />
      </div>
    </>
  );
};

export default OgSplash;
