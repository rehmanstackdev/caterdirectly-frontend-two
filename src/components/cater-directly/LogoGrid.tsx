
import React from "react";
import LogoItem from "./LogoItem";

type LogoGridProps = {
  logos: Array<{ src: string; alt: string }>;
  animatingIndex: number | null;
  isMobile: boolean;
};

const LogoGrid = ({ logos, animatingIndex, isMobile }: LogoGridProps) => {
  return isMobile ? (
    // Mobile view (3 logos in a row)
    <div className="md:hidden flex justify-center mt-8 px-4 w-full">
      <div className="grid grid-cols-3 gap-4 w-full">
        {logos.slice(0, 3).map((logo, index) => (
          <div 
            key={`mobile-${logo.src}-${index}`} 
            className="flex items-center justify-center h-16 bg-white rounded-lg shadow-sm p-2"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <LogoItem
                src={logo.src}
                alt={logo.alt}
                isAnimating={animatingIndex === index}
                isMobile={true}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    // Desktop view (5 logos)
    <div className="hidden md:grid grid-cols-5 gap-8 mt-12 md:mt-16 px-4 w-full max-w-[1400px]">
      {logos.slice(0, 5).map((logo, index) => (
        <div key={`desktop-${logo.src}-${index}`} className="flex items-center justify-center relative h-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <LogoItem
              src={logo.src}
              alt={logo.alt}
              isAnimating={animatingIndex === index}
              isMobile={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogoGrid;
