
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VenueServiceDetailsViewProps {
  details: any;
}

const VenueServiceDetailsView: React.FC<VenueServiceDetailsViewProps> = ({ details }) => {
  if (!details) return null;

  // Parse amenities if stored as string
  const parseAmenities = () => {
    if (!details.venueAmenities && !details.amenities) return [];
    const amenitiesData = details.venueAmenities || details.amenities;
    if (Array.isArray(amenitiesData)) return amenitiesData;
    try {
      return JSON.parse(amenitiesData);
    } catch {
      if (typeof amenitiesData === 'string') {
        return amenitiesData.split(',').map((a: string) => a.trim()).filter(Boolean);
      }
      return [];
    }
  };

  // Parse restrictions if stored as string
  const parseRestrictions = () => {
    if (!details.venueRestrictions && !details.restrictions) return [];
    const restrictionsData = details.venueRestrictions || details.restrictions;
    if (Array.isArray(restrictionsData)) return restrictionsData;
    try {
      return JSON.parse(restrictionsData);
    } catch {
      if (typeof restrictionsData === 'string') {
        return restrictionsData.split(',').map((r: string) => r.trim()).filter(Boolean);
      }
      return [];
    }
  };

  const amenities = parseAmenities();
  const restrictions = parseRestrictions();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Venue Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Capacity */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Capacity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Seated</p>
              <p className="text-lg font-medium">
                {details.seatedCapacity || details.capacity?.seated || 'Not specified'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500">Standing</p>
              <p className="text-lg font-medium">
                {details.standingCapacity || details.capacity?.standing || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Venue Type */}
        {(details.venueType || details.indoorOutdoor) && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Venue Type</h3>
            <Badge variant="outline" className="capitalize">
              {details.venueType === 'both' || details.indoorOutdoor === 'both'
                ? 'Indoor & Outdoor' 
                : details.venueType === 'indoor' || details.indoorOutdoor === 'indoor'
                ? 'Indoor'
                : details.venueType === 'outdoor' || details.indoorOutdoor === 'outdoor'
                ? 'Outdoor'
                : details.venueType === 'indoor_only'
                ? 'Indoor Only'
                : details.venueType === 'outdoor_only'
                ? 'Outdoor Only'
                : (details.venueType || details.indoorOutdoor || '').split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Badge>
          </div>
        )}
        
        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity: string, index: number) => (
                <Badge key={index} variant="secondary">{amenity.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Restrictions */}
        {restrictions && restrictions.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Restrictions</h3>
            <ul className="list-disc pl-5 space-y-1">
              {restrictions.map((restriction: string, index: number) => (
                <li key={index} className="text-gray-600">{restriction.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Accessibility */}
        {details.accessibilityFeatures && details.accessibilityFeatures.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Accessibility Features</h3>
            <div className="flex flex-wrap gap-2">
              {details.accessibilityFeatures.map((feature: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  {feature.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VenueServiceDetailsView;
