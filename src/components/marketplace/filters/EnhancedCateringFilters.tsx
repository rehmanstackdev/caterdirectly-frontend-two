import { useState, useEffect } from 'react';
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
import { formatPricePerPerson, formatGuestCount } from '@/utils/slider-formatting';
import LocationFilterAutocomplete from '@/components/shared/LocationFilterAutocomplete';

interface EnhancedCateringFiltersProps {
  existingServices?: ServiceSelection[];
  onFiltersChange?: (filters: any) => void;
}

const EnhancedCateringFilters = ({
  existingServices = [],
  onFiltersChange
}: EnhancedCateringFiltersProps) => {
  const { filters, updateGlobalFilter, updateLocationFilter, updateCateringFilter, clearFilters } = useFilterContext();
  const [compatibilityMode, setCompatibilityMode] = useState(existingServices.length > 0);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    const newCuisines = checked 
      ? [...filters.catering.cuisineTypes, cuisine]
      : filters.catering.cuisineTypes.filter(c => c !== cuisine);
    updateCateringFilter('cuisineTypes', newCuisines);
  };

  const handleDietaryChange = (dietary: string, checked: boolean) => {
    const newDietary = checked
      ? [...filters.catering.dietaryRestrictions, dietary]
      : filters.catering.dietaryRestrictions.filter(d => d !== dietary);
    updateCateringFilter('dietaryRestrictions', newDietary);
  };

  const handleServiceStyleChange = (style: string, checked: boolean) => {
    const newStyles = checked
      ? [...filters.catering.serviceStyles, style]
      : filters.catering.serviceStyles.filter(s => s !== style);
    updateCateringFilter('serviceStyles', newStyles);
  };

  const hasActiveFilters = () => {
    const globalActive = filters.global.searchQuery !== '' || 
                        filters.global.location !== '' || 
                        (filters.global.timeSlot !== '' && filters.global.timeSlot !== 'anytime');
    
    const cateringActive = filters.catering.priceRange[0] > 0 || 
                          filters.catering.priceRange[1] < 500 ||
                          filters.catering.guestCapacity[0] > 1 || 
                          filters.catering.guestCapacity[1] < 1000 ||
                          filters.catering.cuisineTypes.length > 0 ||
                          filters.catering.dietaryRestrictions.length > 0 ||
                          filters.catering.serviceStyles.length > 0;
    
    return globalActive || cateringActive;
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
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 md:gap-4 w-full max-w-full">
          <div className="flex flex-wrap items-center gap-2 w-full">
            <div className="relative flex-grow min-w-[120px] max-w-full">
              <LocationFilterAutocomplete
                value={filters.global.location}
                onChange={updateLocationFilter}
                placeholder="Location"
                className="w-full"
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
              placeholder="Search cuisine or caterer..."
              className="pl-10 pr-4 py-2 w-full"
              value={filters.global.searchQuery}
              onChange={(e) => updateGlobalFilter('searchQuery', e.target.value)}
            />
          </div>

          {/* Price Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Price Range
                {(filters.catering.priceRange[0] > 0 || filters.catering.priceRange[1] < 500) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatPricePerPerson(filters.catering.priceRange[0])}-{formatPricePerPerson(filters.catering.priceRange[1])}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-6">
              <div className="space-y-6">
                <Label className="text-sm font-medium">Price per person</Label>
                <div className="px-2">
                  <EnhancedSlider 
                    value={filters.catering.priceRange}
                    max={500} 
                    step={5}
                    onValueChange={(value) => updateCateringFilter('priceRange', value as [number, number])}
                    formatValue={formatPricePerPerson}
                    className="mt-6" 
                  />
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>{formatPricePerPerson(filters.catering.priceRange[0])}</span>
                  <span>{formatPricePerPerson(filters.catering.priceRange[1])}+</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Guest Count Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Guest Count
                {(filters.catering.guestCapacity[0] > 1 || filters.catering.guestCapacity[1] < 1000) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatGuestCount(filters.catering.guestCapacity[0])}-{formatGuestCount(filters.catering.guestCapacity[1])}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-6">
              <div className="space-y-6">
                <Label className="text-sm font-medium">Number of guests</Label>
                <div className="px-2">
                  <EnhancedSlider 
                    value={filters.catering.guestCapacity}
                    max={1000} 
                    step={5}
                    onValueChange={(value) => updateCateringFilter('guestCapacity', value as [number, number])}
                    formatValue={formatGuestCount}
                    className="mt-6" 
                  />
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>{formatGuestCount(filters.catering.guestCapacity[0])}</span>
                  <span>{formatGuestCount(filters.catering.guestCapacity[1])}+</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Cuisine Type */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Cuisine Type
                {filters.catering.cuisineTypes.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.catering.cuisineTypes.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select cuisines</Label>
                {[
                  'American', 'Italian', 'Mexican', 'Asian', 'Mediterranean',
                  'BBQ', 'Seafood', 'Vegetarian', 'Farm-to-Table', 'Fusion'
                ].map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cuisine-${cuisine}`}
                      checked={filters.catering.cuisineTypes.includes(cuisine)}
                      onCheckedChange={(checked) => handleCuisineChange(cuisine, !!checked)}
                    />
                    <Label htmlFor={`cuisine-${cuisine}`} className="text-sm cursor-pointer">
                      {cuisine}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Dietary Restrictions */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Dietary
                {filters.catering.dietaryRestrictions.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.catering.dietaryRestrictions.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dietary Options</Label>
                {[
                  'Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free', 
                  'Nut Free', 'Keto', 'Halal', 'Kosher'
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`diet-${option}`}
                      checked={filters.catering.dietaryRestrictions.includes(option)}
                      onCheckedChange={(checked) => handleDietaryChange(option, !!checked)}
                    />
                    <Label htmlFor={`diet-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Service Style */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Service Style
                {filters.catering.serviceStyles.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.catering.serviceStyles.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">How food is served</Label>
                {[
                  { value: 'buffet', label: 'Buffet' },
                  { value: 'plated', label: 'Plated' },
                  { value: 'passed_appetizers', label: 'Passed Appetizers' },
                  { value: 'boxed_individual', label: 'Boxed Individual' },
                  { value: 'food_stations', label: 'Food Stations' }
                ].map((style) => (
                  <div key={style.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`style-${style.value}`}
                      checked={filters.catering.serviceStyles.includes(style.value)}
                      onCheckedChange={(checked) => handleServiceStyleChange(style.value, !!checked)}
                    />
                    <Label htmlFor={`style-${style.value}`} className="text-sm cursor-pointer">
                      {style.label}
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
            {(filters.catering.priceRange[0] > 0 || filters.catering.priceRange[1] < 500) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Price: ${filters.catering.priceRange[0]}-${filters.catering.priceRange[1]}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateCateringFilter('priceRange', [0, 500])}
                />
              </Badge>
            )}

            {/* Guest Count */}
            {(filters.catering.guestCapacity[0] > 1 || filters.catering.guestCapacity[1] < 1000) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Guests: {filters.catering.guestCapacity[0]}-{filters.catering.guestCapacity[1]}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateCateringFilter('guestCapacity', [1, 1000])}
                />
              </Badge>
            )}

            {/* Cuisine Types - grouped with label */}
            {filters.catering.cuisineTypes.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Cuisine: {filters.catering.cuisineTypes.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateCateringFilter('cuisineTypes', [])}
                />
              </Badge>
            )}

            {/* Dietary Restrictions - grouped with label */}
            {filters.catering.dietaryRestrictions.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Dietary: {filters.catering.dietaryRestrictions.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateCateringFilter('dietaryRestrictions', [])}
                />
              </Badge>
            )}

            {/* Service Styles - grouped with label */}
            {filters.catering.serviceStyles.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Service Style: {filters.catering.serviceStyles.map(style =>
                  style === 'buffet' ? 'Buffet' :
                  style === 'plated' ? 'Plated' :
                  style === 'passed_appetizers' ? 'Passed Appetizers' :
                  style === 'boxed_individual' ? 'Boxed Individual' :
                  style === 'food_stations' ? 'Food Stations' : style
                ).join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateCateringFilter('serviceStyles', [])}
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
                  onClick={() => updateLocationFilter('')}
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

export default EnhancedCateringFilters;
