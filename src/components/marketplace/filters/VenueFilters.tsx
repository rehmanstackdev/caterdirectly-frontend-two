
import { FC, useState, useEffect } from 'react';
import { Search, MapPin, Clock, ChevronDown, ShoppingCart, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EnhancedSlider } from "@/components/ui/enhanced-slider";
import { Switch } from "@/components/ui/switch";
import { useFilterContext } from '@/contexts/FilterContext';
import { ServiceSelection } from '@/types/order';
import { formatVenuePrice, formatGuestCount } from '@/utils/slider-formatting';

interface VenueFiltersProps {
  existingServices?: ServiceSelection[];
  onFiltersChange?: (filters: any) => void;
}

function VenueFilters({
  existingServices = [],
  onFiltersChange
}: VenueFiltersProps) {
  const { filters, updateGlobalFilter, updateVenueFilter, clearFilters } = useFilterContext();
  const [compatibilityMode, setCompatibilityMode] = useState(existingServices.length > 0);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const newAmenities = checked 
      ? [...filters.venues.amenities, amenity]
      : filters.venues.amenities.filter(a => a !== amenity);
    updateVenueFilter('amenities', newAmenities);
  };

  const hasActiveFilters = () => {
    const globalActive = filters.global.searchQuery !== '' || 
                        filters.global.location !== '' || 
                        (filters.global.timeSlot !== '' && filters.global.timeSlot !== 'anytime');
    
    const venueActive = filters.venues.priceRange[0] > 0 || 
                       filters.venues.priceRange[1] < 5000 ||
                       filters.venues.guestCapacity[0] > 1 || 
                       filters.venues.guestCapacity[1] < 1000 ||
                       filters.venues.amenities.length > 0;
    
    return globalActive || venueActive;
  };

  return (
    <div className="space-y-4">
      {/* Context Header */}
      {existingServices.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {existingServices.length} service{existingServices.length !== 1 ? 's' : ''} in cart
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="compatibility-mode" className="text-xs text-blue-700">
                Show compatible only
              </Label>
              <Switch
                id="compatibility-mode"
                checked={compatibilityMode}
                onCheckedChange={setCompatibilityMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Filters */}
      <div className="flex flex-wrap gap-2 md:gap-4 w-full max-w-full">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <div className="relative flex-grow min-w-[120px] max-w-full">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Location"
              className="pl-10 pr-4 py-2 w-full"
              value={filters.global.location}
              onChange={(e) => updateGlobalFilter('location', e.target.value)}
            />
          </div>
          
          <Select onValueChange={(value) => updateGlobalFilter('timeSlot', value)} value={filters.global.timeSlot}>
            <SelectTrigger className="w-full min-w-[100px] max-w-[160px]">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anytime">Anytime</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-grow min-w-[120px] w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search venues..."
            className="pl-10 pr-4 py-2 w-full"
            value={filters.global.searchQuery}
            onChange={(e) => updateGlobalFilter('searchQuery', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          {/* Price Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Price Range
                {(filters.venues.priceRange[0] > 0 || filters.venues.priceRange[1] < 5000) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatVenuePrice(filters.venues.priceRange[0])}-{formatVenuePrice(filters.venues.priceRange[1])}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-6">
              <div className="space-y-6">
                <Label className="text-sm font-medium">Venue price range</Label>
                <div className="px-2">
                  <EnhancedSlider 
                    value={filters.venues.priceRange}
                    max={5000} 
                    step={50}
                    onValueChange={(value) => updateVenueFilter('priceRange', value as [number, number])}
                    formatValue={formatVenuePrice}
                    className="mt-6" 
                  />
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>{formatVenuePrice(filters.venues.priceRange[0])}</span>
                  <span>{formatVenuePrice(filters.venues.priceRange[1])}+</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Guest Capacity Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Capacity
                {(filters.venues.guestCapacity[0] > 1 || filters.venues.guestCapacity[1] < 1000) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatGuestCount(filters.venues.guestCapacity[0])}-{formatGuestCount(filters.venues.guestCapacity[1])}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-6">
              <div className="space-y-6">
                <Label className="text-sm font-medium">Guest capacity</Label>
                <div className="px-2">
                  <EnhancedSlider 
                    value={filters.venues.guestCapacity}
                    max={1000} 
                    step={10}
                    onValueChange={(value) => updateVenueFilter('guestCapacity', value as [number, number])}
                    formatValue={formatGuestCount}
                    className="mt-6" 
                  />
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>{formatGuestCount(filters.venues.guestCapacity[0])}</span>
                  <span>{formatGuestCount(filters.venues.guestCapacity[1])}+</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Amenities */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Amenities
                {filters.venues.amenities.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.venues.amenities.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Venue amenities</Label>
                {[
                  'WiFi', 'Parking', 'Catering Kitchen', 'A/V Equipment', 
                  'Wheelchair Accessible', 'Outdoor Space', 'Bar Service', 'Dance Floor'
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`amenity-${amenity}`}
                      checked={filters.venues.amenities.includes(amenity)}
                      onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Active:</span>

            {/* Price Range */}
            {(filters.venues.priceRange[0] > 0 || filters.venues.priceRange[1] < 5000) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Price: {formatVenuePrice(filters.venues.priceRange[0])}-{formatVenuePrice(filters.venues.priceRange[1])}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateVenueFilter('priceRange', [0, 5000])}
                />
              </Badge>
            )}

            {/* Guest Capacity */}
            {(filters.venues.guestCapacity[0] > 1 || filters.venues.guestCapacity[1] < 1000) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Capacity: {formatGuestCount(filters.venues.guestCapacity[0])}-{formatGuestCount(filters.venues.guestCapacity[1])}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateVenueFilter('guestCapacity', [1, 1000])}
                />
              </Badge>
            )}

            {/* Amenities - grouped with label */}
            {filters.venues.amenities.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Amenities: {filters.venues.amenities.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateVenueFilter('amenities', [])}
                />
              </Badge>
            )}

            {/* Location */}
            {filters.global.location && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.global.location}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateGlobalFilter('location', '')}
                />
              </Badge>
            )}

            {/* Time Slot */}
            {filters.global.timeSlot && filters.global.timeSlot !== 'anytime' && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {filters.global.timeSlot.charAt(0).toUpperCase() + filters.global.timeSlot.slice(1)}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateGlobalFilter('timeSlot', 'anytime')}
                />
              </Badge>
            )}

            {/* Search Query */}
            {filters.global.searchQuery && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <Search className="h-3 w-3" />
                "{filters.global.searchQuery}"
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateGlobalFilter('searchQuery', '')}
                />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilters()}
              className="text-xs h-6 px-2 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueFilters;
