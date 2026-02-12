
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { ServiceItem } from '@/types/service-types';
import ServiceImage from '@/components/shared/ServiceImage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface ServiceBasicInfoProps {
  service: ServiceItem;
  getStatusLabel: (status: string, active: boolean) => string;
  getStatusBadgeColor: (status: string, active: boolean) => string;
}

const ServiceBasicInfo: React.FC<ServiceBasicInfoProps> = ({ 
  service,
  getStatusLabel,
  getStatusBadgeColor
}) => {
  // Memoize the image source to prevent unnecessary re-renders
  const imageSource = useMemo(() => {
    // For catering services, prioritize menu images
    if (service.type === 'catering') {
      const menuImage = service.service_details?.catering?.menu_images?.[0];
      if (menuImage) return menuImage;
    }
    
    // Return the service image or a fallback
    return service.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&auto=format';
  }, [service.image, service.type, service.service_details]);

  const serviceImages = useMemo(() => {
    if (service.type === 'catering') {
      const menuImages = service.service_details?.catering?.menu_images;
      return Array.isArray(menuImages) && menuImages.length > 0 ? menuImages : [imageSource];
    }

    const venueImages =
      service.service_details?.venue?.serviceImages ||
      service.service_details?.serviceImages ||
      service.images ||
      service.additional_images;

    if (Array.isArray(venueImages) && venueImages.length > 0) {
      return Array.from(new Set(venueImages.filter(Boolean)));
    }

    if (typeof venueImages === 'string' && venueImages) {
      return [venueImages];
    }

    const cover = service.service_details?.venue?.serviceImage;
    return Array.from(new Set([cover || imageSource].filter(Boolean)));
  }, [imageSource, service.type, service.service_details, service.images, service.additional_images]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{service.name}</CardTitle>
            <CardDescription>{service.type.charAt(0).toUpperCase() + service.type.slice(1)} Service</CardDescription>
          </div>
          <Badge className={getStatusBadgeColor(service.status, service.active)}>
            {getStatusLabel(service.status, service.active)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-80 w-full rounded-md overflow-hidden bg-gray-50 md:h-96">
              {serviceImages.length > 1 ? (
                <Carousel className="h-full w-full">
                  <CarouselContent className="h-full">
                    {serviceImages.map((image, index) => (
                      <CarouselItem key={index} className="h-full flex items-center justify-center">
                        <ServiceImage
                          src={image}
                          alt={`${service.name || 'Service'} image ${index + 1}`}
                          className="w-full h-full max-w-[85%]"
                          showLoadingPlaceholder={true}
                          service={service}
                          priority={index === 0}
                          objectFit="contain"
                          aspectRatio="aspect-auto"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              ) : (
                <ServiceImage 
                  src={serviceImages[0]}
                  alt={service.name || 'Service image'}
                  className="w-full h-full max-w-[85%]"
                  showLoadingPlaceholder={true}
                  service={service}
                  priority={true}
                  objectFit="contain"
                  aspectRatio="aspect-auto"
                />
              )}
            </div>

            {service.rating && (
              <div className="flex items-center mt-4">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{service.rating}</span>
                <span className="text-gray-500 text-sm ml-1">({service.reviews} reviews)</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Description</h3>
              <p className="mt-1 text-gray-600">{service.description || "No description available."}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Price</h3>
              <p className="mt-1 text-[#F07712] font-semibold text-xl">{service.price}</p>
              <p className="text-sm text-gray-500">
                {service.price_type === 'per_person' ? 'Per Person' : 
                 service.price_type === 'per_hour' ? 'Per Hour' : 'Flat Rate'}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Location</h3>
              <p className="mt-1 text-gray-600">{service.location || "No location specified"}</p>
            </div>

            {service.status === 'rejected' && service.adminFeedback && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="font-semibold text-red-800">Admin Feedback</h3>
                <p className="mt-1 text-red-700">{service.adminFeedback}</p>
              </div>
            )}

            {service.isManaged && (
              <div className="p-4 bg-[#F07712]/10 border border-[#F07712]/20 rounded-md">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <h3 className="font-semibold text-[#F07712] cursor-help">Managed Service</h3>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-2">
                      <p className="text-sm">This service is managed by our team, meeting the highest quality and reliability standards.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="mt-1 text-gray-700">
                  This service is managed by our team, meeting the highest quality and reliability standards.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceBasicInfo;
