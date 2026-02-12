

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
import { formatHourlyRate } from '@/utils/slider-formatting';

interface StaffingFiltersProps {
  existingServices?: ServiceSelection[];
}

const StaffingFilters = ({ existingServices = [] }: StaffingFiltersProps) => {
  const { filters, updateGlobalFilter, updateStaffingFilter, clearFilters } = useFilterContext();

  // Context awareness
  const hasCatering = existingServices.some(s => s.serviceType === 'catering');
  const hasVenue = existingServices.some(s => s.serviceType === 'venues');
  const guestCount = existingServices.reduce((max, service) => Math.max(max, service.quantity || 0), 0);
  const isLargeEvent = guestCount > 100;

  const handleRoleChange = (role: string, checked: boolean) => {
    const newRoles = checked 
      ? [...filters.staffing.roles, role]
      : filters.staffing.roles.filter(r => r !== role);
    updateStaffingFilter('roles', newRoles);
  };

  const handleExperienceChange = (experience: string, checked: boolean) => {
    const newExperience = checked 
      ? [...filters.staffing.experience, experience]
      : filters.staffing.experience.filter(e => e !== experience);
    updateStaffingFilter('experience', newExperience);
  };

  const handleAvailabilityChange = (availability: string, checked: boolean) => {
    const newAvailability = checked 
      ? [...filters.staffing.availability, availability]
      : filters.staffing.availability.filter(a => a !== availability);
    updateStaffingFilter('availability', newAvailability);
  };

  const hasActiveFilters = () => {
    const globalActive = filters.global.searchQuery !== '' || 
                        filters.global.location !== '' || 
                        (filters.global.timeSlot !== '' && filters.global.timeSlot !== 'anytime');
    
    const staffingActive = filters.staffing.hourlyRate[0] > 15 || 
                          filters.staffing.hourlyRate[1] < 100 ||
                          filters.staffing.roles.length > 0 ||
                          filters.staffing.experience.length > 0 ||
                          filters.staffing.availability.length > 0;
    
    return globalActive || staffingActive;
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
                Showing staff compatible with your event
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
                  Large event - senior staff recommended
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
              <SelectValue placeholder="Schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anytime">Anytime</SelectItem>
              <SelectItem value="full_day">Full Day</SelectItem>
              <SelectItem value="evening_only">Evening Only</SelectItem>
              <SelectItem value="weekend">Weekend</SelectItem>
              <SelectItem value="last_minute">Last Minute</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-grow min-w-[120px] w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search staff roles..."
            className="pl-10 pr-4 py-2 w-full"
            value={filters.global.searchQuery}
            onChange={(e) => updateGlobalFilter('searchQuery', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full">
          {/* Hourly Rate Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Hourly Rate
                {(filters.staffing.hourlyRate[0] !== 15 || filters.staffing.hourlyRate[1] !== 100) && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formatHourlyRate(filters.staffing.hourlyRate[0])}-{formatHourlyRate(filters.staffing.hourlyRate[1])}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-6">
              <div className="space-y-6">
                <Label className="text-sm font-medium">Hourly rate range</Label>
                <div className="px-2">
                  <EnhancedSlider 
                    value={filters.staffing.hourlyRate} 
                    onValueChange={(value) => updateStaffingFilter('hourlyRate', value as [number, number])}
                    max={100} 
                    min={15}
                    step={5}
                    formatValue={formatHourlyRate}
                    className="mt-6" 
                  />
                </div>
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span>{formatHourlyRate(filters.staffing.hourlyRate[0])}</span>
                  <span>{formatHourlyRate(filters.staffing.hourlyRate[1])}</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Staff Roles Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Staff Roles
                {filters.staffing.roles.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.staffing.roles.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select roles</Label>
                {[
                  { name: 'Servers', contextual: hasCatering },
                  { name: 'Bartenders', contextual: hasCatering },
                  { name: 'Event Coordinators', contextual: isLargeEvent },
                  { name: 'Security', contextual: isLargeEvent },
                  { name: 'Kitchen Staff', contextual: hasCatering },
                  { name: 'Setup Crew', contextual: false },
                  { name: 'Cleanup Crew', contextual: false },
                  { name: 'Photographers', contextual: false }
                ].map((role) => (
                  <div key={role.name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`role-${role.name}`}
                      checked={filters.staffing.roles.includes(role.name)}
                      onCheckedChange={(checked) => handleRoleChange(role.name, !!checked)}
                      className={role.contextual ? 'border-blue-500' : ''}
                    />
                    <Label 
                      htmlFor={`role-${role.name}`} 
                      className={`text-sm cursor-pointer ${role.contextual ? 'text-blue-600 font-medium' : ''}`}
                    >
                      {role.name}
                      {role.contextual && <span className="ml-1">✓</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Experience Level Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Experience
                {filters.staffing.experience.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.staffing.experience.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Experience level</Label>
                {[
                  { name: 'Entry Level (0-1 years)', contextual: false },
                  { name: 'Experienced (2-5 years)', contextual: false },
                  { name: 'Senior (5+ years)', contextual: isLargeEvent },
                  { name: 'Expert (10+ years)', contextual: isLargeEvent }
                ].map((level) => (
                  <div key={level.name} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`exp-${level.name}`}
                      checked={filters.staffing.experience.includes(level.name)}
                      onCheckedChange={(checked) => handleExperienceChange(level.name, !!checked)}
                      className={level.contextual ? 'border-blue-500' : ''}
                    />
                    <Label 
                      htmlFor={`exp-${level.name}`} 
                      className={`text-sm cursor-pointer ${level.contextual ? 'text-blue-600 font-medium' : ''}`}
                    >
                      {level.name}
                      {level.contextual && <span className="ml-1">✓</span>}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Availability Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1 text-xs md:text-sm flex-grow">
                Availability
                {filters.staffing.availability.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filters.staffing.availability.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Schedule options</Label>
                {[
                  'Full Day Available', 'Evening Only', 'Weekend Available', 
                  'Last Minute Bookings', 'Overnight Events'
                ].map((availability) => (
                  <div key={availability} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`avail-${availability}`}
                      checked={filters.staffing.availability.includes(availability)}
                      onCheckedChange={(checked) => handleAvailabilityChange(availability, !!checked)}
                    />
                    <Label htmlFor={`avail-${availability}`} className="text-sm cursor-pointer">
                      {availability}
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

            {/* Hourly Rate */}
            {(filters.staffing.hourlyRate[0] !== 15 || filters.staffing.hourlyRate[1] !== 100) && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Rate: {formatHourlyRate(filters.staffing.hourlyRate[0])}-{formatHourlyRate(filters.staffing.hourlyRate[1])}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateStaffingFilter('hourlyRate', [15, 100])}
                />
              </Badge>
            )}

            {/* Staff Roles - grouped with label */}
            {filters.staffing.roles.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Roles: {filters.staffing.roles.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateStaffingFilter('roles', [])}
                />
              </Badge>
            )}

            {/* Experience Levels - grouped with label */}
            {filters.staffing.experience.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Experience: {filters.staffing.experience.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateStaffingFilter('experience', [])}
                />
              </Badge>
            )}

            {/* Availability - grouped with label */}
            {filters.staffing.availability.length > 0 && (
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                Availability: {filters.staffing.availability.join(', ')}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => updateStaffingFilter('availability', [])}
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

export default StaffingFilters;
