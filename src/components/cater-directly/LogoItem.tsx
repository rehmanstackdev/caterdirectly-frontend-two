
import React from "react";

type LogoItemProps = {
  src: string;
  alt: string;
  isAnimating: boolean;
  isMobile: boolean;
};

const LogoItem = ({ src, alt, isAnimating, isMobile }: LogoItemProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={
        isMobile
          ? `w-full h-12 object-contain transition-all duration-1000 ease-in-out ${
              isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
            }`
          : isAnimating
          ? "absolute w-32 h-20 object-contain transition-all duration-1000 ease-in-out opacity-0 transform translate-y-6"
          : "absolute w-32 h-20 object-contain transition-all duration-1000 ease-in-out opacity-100 transform translate-y-0"
      }
    />
  );
};

export default LogoItem;
