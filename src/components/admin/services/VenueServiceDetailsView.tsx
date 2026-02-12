

import { ServiceItem } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ServiceImage from '@/components/shared/ServiceImage';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Users, 
  DollarSign, 
  Home, 
  Shield, 
  FileCheck, 
  Accessibility,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export interface VenueServiceDetailsViewProps {
  service: ServiceItem;
}

const VenueServiceDetailsView = ({ service }: VenueServiceDetailsViewProps) => {
  const venue = service.service_details?.venue || service.service_details;

  if (!venue) {
    return <div className="text-gray-400">No venue details available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPricingType = (type: string) => {
    if (!type) return 'Not specified';
    const types: Record<string, string> = {
      'hourly_rate': 'Hourly Rate',
      'daily_rate': 'Daily Rate',
      'flat_rate': 'Flat Rate',
      'per_person': 'Per Person',
      'per_day': 'Per Day',
      'per_hour': 'Per Hour'
    };
    return types[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatVenueType = (type: string) => {
    if (!type) return 'Not specified';
    const types: Record<string, string> = {
      'indoor': 'Indoor',
      'outdoor': 'Outdoor',
      'indoor_only': 'Indoor Only',
      'outdoor_only': 'Outdoor Only',
      'both': 'Indoor & Outdoor'
    };
    return types[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatVendorPolicy = (policy: string) => {
    if (!policy) return 'Not specified';
    const policies: Record<string, string> = {
      'exclusive': 'Exclusive Vendors Only',
      'preferred': 'Preferred Vendors',
      'open': 'Open to All Vendors',
      'exclusive_vendors': 'Exclusive Vendors Only',
      'preferred_vendors': 'Preferred Vendors',
      'open_vendors': 'Open to All Vendors'
    };
    return policies[policy] || policy.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Parse amenities if stored as string
  const parseAmenities = () => {
    if (!venue.venueAmenities) return [];
    if (Array.isArray(venue.venueAmenities)) return venue.venueAmenities;
    try {
      return JSON.parse(venue.venueAmenities);
    } catch {
      return venue.venueAmenities.split(',').map((a: string) => a.trim());
    }
  };

  // Parse restrictions if stored as string
  const parseRestrictions = () => {
    if (!venue.venueRestrictions) return [];
    if (Array.isArray(venue.venueRestrictions)) return venue.venueRestrictions;
    try {
      return JSON.parse(venue.venueRestrictions);
    } catch {
      return venue.venueRestrictions.split(',').map((r: string) => r.trim());
    }
  };

  const amenities = parseAmenities();
  const restrictions = parseRestrictions();

  return (
    <div className="space-y-6">
      {/* Service Images Slider */}
      {venue.serviceImages && venue.serviceImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Venue Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <Carousel className="w-full">
                <CarouselContent>
                  {venue.serviceImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border bg-gray-50">
                        <ServiceImage 
                          src={image}
                          alt={`${service.name} - Image ${index + 1}`}
                          className="w-full h-full"
                          objectFit="contain"
                          imageId={`venue-${service.id}-${index}`}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing & Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pricing Type</p>
              <Badge variant="secondary" className="text-sm">
                {formatPricingType(venue.pricingType)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Price</p>
              <p className="text-2xl font-bold text-[#F07712]">
                {formatCurrency(venue.price)}
              </p>
            </div>
            {venue.minimumGuests && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Minimum Guests</p>
                <p className="text-lg font-semibold">{venue.minimumGuests} guests</p>
              </div>
            )}
            {venue.maximumGuests && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Maximum Guests</p>
                <p className="text-lg font-semibold">{venue.maximumGuests} guests</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-gray-600 mb-1">Seated</p>
                {venue.seatedCapacity ? (
                  <>
                    <p className="text-3xl font-bold text-blue-600">
                      {venue.seatedCapacity}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">people</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Not specified</p>
                )}
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium text-gray-600 mb-1">Standing</p>
                {venue.standingCapacity ? (
                  <>
                    <p className="text-3xl font-bold text-green-600">
                      {venue.standingCapacity}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">people</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">Not specified</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Venue Type & Vendor Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            Venue Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Venue Type</p>
              <Badge variant="outline" className="text-sm">
                {formatVenueType(venue.venueType)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Vendor Policy</p>
              <Badge variant="outline" className="text-sm">
                {formatVendorPolicy(venue.vendorPolicy)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Amenities & Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="outline" className="py-1.5 px-3 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restrictions */}
      {restrictions && restrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {restrictions.map((restriction: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>{restriction.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Features */}
      {venue.accessibilityFeatures && venue.accessibilityFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-blue-600" />
              Accessibility Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {venue.accessibilityFeatures.map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="py-1.5 px-3 bg-blue-50 text-blue-700 border-blue-200">
                  <Accessibility className="h-3 w-3 mr-1" />
                  {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements */}
      {((venue.insuranceRequirements && venue.insuranceRequirements.length > 0) || 
        (venue.licenseRequirements && venue.licenseRequirements.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-600" />
              Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {venue.insuranceRequirements && venue.insuranceRequirements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-gray-700">Insurance Requirements</p>
                </div>
                <ul className="space-y-1 ml-6">
                  {venue.insuranceRequirements.map((req: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 list-disc">
                      {req.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {venue.licenseRequirements && venue.licenseRequirements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="h-4 w-4 text-amber-600" />
                  <p className="text-sm font-semibold text-gray-700">License Requirements</p>
                </div>
                <ul className="space-y-1 ml-6">
                  {venue.licenseRequirements.map((req: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 list-disc">
                      {req.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {service.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {service.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VenueServiceDetailsView;
