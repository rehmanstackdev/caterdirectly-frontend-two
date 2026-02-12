
import React from "react";
import UnifiedImage from "./UnifiedImage";
import { ServiceItem } from "@/types/service-types";

export interface ServiceImageProps {
  src: string | ServiceItem | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
  imageId?: string;
  showLoadingPlaceholder?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  service?: ServiceItem;
  retryOnError?: boolean;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  fallbackImage?: string;
}

const ServiceImage = ({
  src,
  alt,
  className = "",
  aspectRatio = "aspect-[4/3]",
  imageId,
  showLoadingPlaceholder = false,
  onLoad,
  onError,
  service,
  priority = false,
  fallbackImage,
  objectFit = "cover"
}: ServiceImageProps) => {
  const resolvedSrc = typeof src === "string" ? src : undefined;
  const resolvedService =
    resolvedSrc ? undefined : service || (typeof src === "object" ? src : undefined);

  return (
    <UnifiedImage
      service={resolvedService}
      src={resolvedSrc}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      priority={priority}
      onLoad={onLoad}
      onError={onError}
      showLoadingState={showLoadingPlaceholder}
      enableRetry={true}
    />
  );
};

export default ServiceImage;
