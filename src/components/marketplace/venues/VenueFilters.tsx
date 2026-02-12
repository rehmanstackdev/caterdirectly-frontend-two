
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedSlider } from "@/components/ui/enhanced-slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatVenuePrice } from "@/utils/slider-formatting";
import { useFilterContext } from "@/contexts/FilterContext";

const VenueFilters = () => {
  const { filters, updateVenueFilter } = useFilterContext();
  const [priceRange, setPriceRange] = useState(filters.venues.priceRange);

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    updateVenueFilter('priceRange', newRange);
  };

  const handleCapacityChange = (capacityId: string, checked: boolean) => {
    // This would need to be implemented based on your filter context structure
    console.log('Capacity filter changed:', capacityId, checked);
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    const currentAmenities = filters.venues.amenities;
    if (checked) {
      updateVenueFilter('amenities', [...currentAmenities, amenityId]);
    } else {
      updateVenueFilter('amenities', currentAmenities.filter(a => a !== amenityId));
    }
  };

  return (
    <Card className="sticky top-24 w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Price Range</h3>
            <div className="px-2">
              <EnhancedSlider 
                value={priceRange}
                onValueChange={handlePriceChange}
                max={5000} 
                step={100} 
                formatValue={formatVenuePrice}
                className="mt-6" 
              />
            </div>
            <div className="flex justify-between mt-4 text-sm text-muted-foreground">
              <span>{formatVenuePrice(0)}</span>
              <span>{formatVenuePrice(5000)}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Capacity</h3>
            <div className="space-y-2">
              {[
                { id: "cap-50", label: "Up to 50 people" },
                { id: "cap-100", label: "50-100 people" },
                { id: "cap-200", label: "100-200 people" },
                { id: "cap-500", label: "200-500 people" },
                { id: "cap-1000", label: "500+ people" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id} 
                    onCheckedChange={(checked) => handleCapacityChange(item.id, checked as boolean)}
                  />
                  <Label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Amenities</h3>
            <div className="space-y-2">
              {[
                { id: "wifi", label: "WiFi" },
                { id: "parking", label: "Parking" },
                { id: "catering", label: "Catering Allowed" },
                { id: "av", label: "A/V Equipment" },
                { id: "accessible", label: "Wheelchair Accessible" },
                { id: "outdoor", label: "Outdoor Space" },
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={item.id}
                    checked={filters.venues.amenities.includes(item.id)}
                    onCheckedChange={(checked) => handleAmenityChange(item.id, checked as boolean)}
                  />
                  <Label htmlFor={item.id} className="text-sm cursor-pointer flex-1">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VenueFilters;
