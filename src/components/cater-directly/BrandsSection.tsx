
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { allCompanyLogos } from "@/data/company-logos";
import { useLogoAnimation } from "@/utils/logo-animation-utils";
import LogoGrid from "./LogoGrid";

const BrandsSection = () => {
  const isMobile = useIsMobile();
  const visibleCount = isMobile ? 3 : 5;
  
  const { visibleLogos, animatingIndex } = useLogoAnimation(
    allCompanyLogos,
    visibleCount
  );

  return (
    <section className="flex flex-col items-center pt-2 pb-6">
      <div className="text-[rgba(240,119,18,1)] text-sm font-semibold text-center mt-4 md:mt-8">
        Our network
      </div>
      <h2 className="text-[#333] text-center text-4xl md:text-5xl font-bold leading-tight mt-4 max-md:max-w-full">
        Trusted by Leading Brands
      </h2>
      <div className="text-black text-base md:text-lg font-normal leading-7 md:leading-8 mt-3 max-md:max-w-full">
        Our network of vendors has proudly served esteemed clients, including
      </div>
      
      <LogoGrid 
        logos={visibleLogos} 
        animatingIndex={animatingIndex} 
        isMobile={isMobile} 
      />
    </section>
  );
};

export default BrandsSection;
