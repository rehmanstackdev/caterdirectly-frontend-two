

import { Search, MapPin, Clock, ChevronDown, ShoppingCart, X } from 'lucide-react';
import { ServiceSelection } from '@/types/order';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedSlider } from '@/components/ui/enhanced-slider';
import { useFilterContext } from '@/contexts/FilterContext';
import { formatCurrency } from '@/utils/slider-formatting';

interface PartyRentalFiltersProps {
  existingServices?: ServiceSelection[];
}

const PartyRentalFilters = ({ existingServices = [] }: PartyRentalFiltersProps) => {
  const { filters, updateGlobalFilter, updateRentalFilter, clearFilters } = useFilterContext();

  // Context awareness
  const hasVenue = existingServices.some(s => s.serviceType === 'venues');
  const hasCatering = existingServices.some(s => s.serviceType === 'catering');
  const guestCount = existingServices.reduce((max, service) => Math.max(max, service.quantity || 0), 0);
  const isLargeEvent = guestCount > 100;

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...filters.rentals.categories, category]
      : filters.rentals.categories.filter(c => c !== category);
    updateRentalFilter('categories', newCategories);
  };

  const handleDeliveryOptionChange = (option: string, checked: boolean) => {
    const newOptions = checked 
      ? [...filters.rentals.deliveryOptions, option]
      : filters.rentals.deliveryOptions.filter(o => o !== option);
    updateRentalFilter('deliveryOptions', newOptions);
  };

  const hasActiveFilters = () => {
    const globalActive = filters.global.searchQuery !== '' || 
                        filters.global.location !== '' || 
                        (filters.global.timeSlot !== '' && filters.global.timeSlot !== 'anytime');
    
    const rentalActive = filters.rentals.priceRange[0] > 0 || 
                        filters.rentals.priceRange[1] < 1000 ||
                        filters.rentals.categories.length > 0 ||
                        filters.rentals.deliveryOptions.length > 0;
    
    return globalActive || rentalActive;
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
                Showing rentals that complement your services
              </span>
            </div>
          </div>
          
          {guestCount > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-blue-700 font-medium">
                Event size: {guestCount} guests
              </p>
              {isLargeEvent && (
                <Badge variant="outline" className="text-xs mr-1">
                  Large event - additional equipment recommended
                </Badge>
              )}
              {hasVenue && (
                <Badge variant="outline" className="text-xs mr-1">
                  Check venue restrictions
                </Badge>
              )}
            </div>
          )}
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
          
          <Select value={filters.global.timeSlot} onValueChange={(value) => updateGlobalFilter('timeSlot', value)}>
            <SelectTrigger className="w-full min-w-[100px] max-w-[160px]">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anytime">Any Duration</SelectItem>
              <SelectItem value="half_day">Half Day</SelectItem>
              <SelectItem value="full_day">Full Day</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
              <SelectItem value="multi_day">Multi-Day</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-grow min-w-[120px] w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search rentals..."
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
                {(filters.rentals.priceRange[0] > 0 || filters.rentals.priceRange[1] < 1000) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatCurrency(filters.rentals.priceRange[0])}-{formatCurrency(filters.rentals.priceRange[1])}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-6">
              <div className="space-y-6">
                <Label className="text-sm font-medium">Rental price range</Label>
                <div className="px-2">
                  <EnhancedSlider 
                    value={filters.rentals.priceRange} 
                    onValueChange={(value) => updateRentalFilter('priceRange', value as [number, number])}
                    max={2000} 
                    step={25}
                    formatValue={formatCurrency}
                    className="mt-6" 
                  />
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>{formatCurrency(filters.rentals.priceRange[0])}</span>
                  <span>{formatCurrency(filters.rentals.priceRange[1])}+</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Rental Categories Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Categories
                {filters.rentals.categories.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.rentals.categories.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select categories</Label>
                {[
                  { name: 'Tables & Chairs', contextual: true },
                  { name: 'Tents & Canopies', contextual: false },
                  { name: 'Audio/Visual', contextual: hasCatering },
                  { name: 'Lighting', contextual: false },
                  { name: 'Linens & Decor', contextual: true },
                  { name: 'Bars & Serving', contextual: hasCatering },
                  { name: 'Dance Floors', contextual: isLargeEvent },
                  { name: 'Games & Entertainment', contextual: false }
                ].map((category) => (
                  <div key={category.name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${category.name}`}
                      checked={filters.rentals.categories.includes(category.name)}
                      onCheckedChange={(checked) => handleCategoryChange(category.name, !!checked)}
                      className={category.contextual ? 'border-blue-500' : ''}
                    />
                    <Label 
                      htmlFor={`cat-${category.name}`} 
                      className={`text-sm cursor-pointer ${category.contextual ? 'text-blue-600 font-medium' : ''}`}
                    >
                      {category.name}
                      {category.contextual && <span className="ml-1">✓</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Delivery Options Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Delivery
                {filters.rentals.deliveryOptions.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.rentals.deliveryOptions.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Delivery options</Label>
                {[
                  'Delivery Available', 'Setup Included', 'Pickup Available'
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`delivery-${option}`}
                      checked={filters.rentals.deliveryOptions.includes(option)}
                      onCheckedChange={(checked) => handleDeliveryOptionChange(option, !!checked)}
                    />
                    <Label htmlFor={`delivery-${option}`} className="text-sm cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap items-center gap-2 w-full">
            <span className="text-xs font-medium text-muted-foreground">Active:</span>

            {/* Price Range */}
            {(filters.rentals.priceRange[0] > 0 || filters.rentals.priceRange[1] < 1000) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Price: {formatCurrency(filters.rentals.priceRange[0])}-{formatCurrency(filters.rentals.priceRange[1])}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateRentalFilter('priceRange', [0, 1000])}
                />
              </Badge>
            )}

            {/* Categories - grouped with label */}
            {filters.rentals.categories.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Categories: {filters.rentals.categories.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateRentalFilter('categories', [])}
                />
              </Badge>
            )}

            {/* Delivery Options - grouped with label */}
            {filters.rentals.deliveryOptions.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Delivery: {filters.rentals.deliveryOptions.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateRentalFilter('deliveryOptions', [])}
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
                {filters.global.timeSlot.charAt(0).toUpperCase() + filters.global.timeSlot.slice(1).replace('_', ' ')}
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

export default PartyRentalFilters;
