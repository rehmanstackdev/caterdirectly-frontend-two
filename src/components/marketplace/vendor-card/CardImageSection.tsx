import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { toast } from "sonner";
import { ServiceItem } from "@/types/service-types";
import UnifiedImage from "@/components/shared/UnifiedImage";
import { useUnifiedServiceImage } from "@/hooks/useUnifiedServiceImage";
import { useFavorites } from "@/hooks/use-favorites";
import ManagedBadge from "@/components/shared/ManagedBadge";

interface CardImageSectionProps {
  id: string;
  image: string;
  name: string;
  available: boolean;
  isManaged?: boolean;
  service?: ServiceItem;
  onImageError?: () => void;
  priority?: boolean;
}

const CardImageSection = ({
  id,
  image,
  name,
  available,
  isManaged = false,
  service,
  onImageError,
  priority = false,
}: CardImageSectionProps) => {
  const {
    isFavorited,
    toggleFavorite,
    promptLogin,
    isAuthenticated,
    favoritedServices,
  } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  const [localIsFavorited, setLocalIsFavorited] = useState(false);

  // Sync local state with hook state
  useEffect(() => {
    setLocalIsFavorited(isFavorited(id));
  }, [isFavorited, id, favoritedServices]);

  // Get the best image URL using unified system
  const { imageUrl: unifiedImageUrl } = useUnifiedServiceImage(service, {
    priority,
  });

  // Prefer an explicit image prop if it's a non-empty string; otherwise fall back to unified
  const resolvedSrc =
    typeof image === "string" && image.trim().length > 0
      ? image
      : unifiedImageUrl;

  const isVenueService =
    (service?.type || service?.serviceType || "").toString().toLowerCase() ===
      "venue" ||
    (service?.type || service?.serviceType || "").toString().toLowerCase() ===
      "venues";

  const getVenueImages = (): string[] => {
    const raw =
      service?.service_details?.venue?.serviceImages ||
      service?.service_details?.serviceImages ||
      service?.service_details?.venueImages ||
      service?.service_details?.images ||
      null;

    if (!raw) {
      return resolvedSrc ? [resolvedSrc] : [];
    }

    if (Array.isArray(raw)) {
      return raw.filter(Boolean);
    }

    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const venueImages = isVenueService ? getVenueImages() : [];

  // Lightweight debug to trace image source selection
  useEffect(() => {
    console.debug("[CardImageSection] image resolution", {
      id,
      propImage: image,
      unifiedImageUrl,
      resolvedSrc,
    });
  }, [id, image, unifiedImageUrl, resolvedSrc]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      promptLogin();
      return;
    }

    if (!service) return;

    setIsLoading(true);

    try {
      // Use toggleFavorite from hook which handles API call and reload logic
      await toggleFavorite(service);

      // Don't update local state - let the hook handle all state management
      // The useEffect will sync local state with hook state automatically
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Local state will be synced with hook state via useEffect
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
      {isVenueService && venueImages.length > 0 ? (
        <Carousel className="w-full">
          <CarouselContent>
            {venueImages.map((img, index) => (
              <CarouselItem key={index}>
                <UnifiedImage
                  service={service}
                  src={img}
                  alt={`${name} - Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  aspectRatio="aspect-[4/3]"
                  priority={priority}
                  onError={onImageError}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      ) : (
        <UnifiedImage
          service={service}
          src={resolvedSrc}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          aspectRatio="aspect-[4/3]"
          priority={priority}
          onError={onImageError}
        />
      )}
      {/* Top badges and favorites */}
      <div className="absolute top-3 right-3 flex flex-row gap-2 items-center">
        {/* Managed badge */}
        {isManaged && <ManagedBadge />}

        {/* Favorites button */}
        <button
          onClick={handleFavoriteToggle}
          disabled={isLoading}
          className={`p-2 rounded-full shadow-sm transition-colors duration-200 ${
            isAuthenticated && localIsFavorited
              ? "bg-red-50"
              : "bg-white/80 hover:bg-white"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={
            !isAuthenticated
              ? "Log in to save favorites"
              : localIsFavorited
                ? "Remove from favorites"
                : "Add to favorites"
          }
        >
          <Heart
            className={`w-5 h-5 transition-colors duration-200 ${
              isAuthenticated && localIsFavorited
                ? "text-red-500 fill-red-500"
                : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {!available && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Badge variant="destructive">Unavailable</Badge>
        </div>
      )}
    </div>
  );
};

export default CardImageSection;
