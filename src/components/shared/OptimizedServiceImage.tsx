import React from "react";
import UnifiedImage from "./UnifiedImage";
import { ServiceItem } from "@/types/service-types";

export interface OptimizedServiceImageProps {
  service: ServiceItem | string | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedServiceImage = ({
  service,
  alt,
  className = "",
  aspectRatio = "aspect-[4/3]",
  priority = false,
  onLoad,
  onError
}: OptimizedServiceImageProps) => {
  return (
    <UnifiedImage
      service={service}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      priority={priority}
      onLoad={onLoad}
      onError={onError}
      showLoadingState={true}
      enableRetry={true}
    />
  );
};

export default OptimizedServiceImage;