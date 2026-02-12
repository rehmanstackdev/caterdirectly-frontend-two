
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info, Users } from 'lucide-react';

interface CateringGuestLimitsProps {
  minGuests?: number;
  maxGuests?: number;
  onMinGuestsChange: (value: number) => void;
  onMaxGuestsChange: (value: number) => void;
}

const CateringGuestLimits: React.FC<CateringGuestLimitsProps> = ({
  minGuests,
  maxGuests,
  onMinGuestsChange,
  onMaxGuestsChange
}) => {
  const handleMinGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onMinGuestsChange(isNaN(value) ? undefined : value);
  };

  const handleMaxGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onMaxGuestsChange(isNaN(value) ? undefined : value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Label htmlFor="min-guests" className="block">Minimum Guests</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">The minimum number of guests required for this catering service.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Users className="h-4 w-4" />
          </span>
          <Input
            id="min-guests"
            type="number"
            className="pl-8"
            placeholder="1"
            value={minGuests || ''}
            onChange={handleMinGuestsChange}
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Label htmlFor="max-guests" className="block">Maximum Guests</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">The maximum number of guests you can accommodate. Leave empty if there's no limit.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Users className="h-4 w-4" />
          </span>
          <Input
            id="max-guests"
            type="number"
            className="pl-8"
            placeholder="No limit"
            value={maxGuests || ''}
            onChange={handleMaxGuestsChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CateringGuestLimits;
