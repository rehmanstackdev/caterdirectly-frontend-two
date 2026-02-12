
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CateringServiceStyle } from '@/types/service-types';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface CateringServiceStylesProps {
  serviceStyles: CateringServiceStyle[];
  onServiceStyleChange: (styles: CateringServiceStyle[]) => void;
}

const CateringServiceStyles: React.FC<CateringServiceStylesProps> = ({
  serviceStyles,
  onServiceStyleChange
}) => {
  const handleServiceStyleChange = (style: CateringServiceStyle, checked: boolean) => {
    let updatedStyles: CateringServiceStyle[];
    
    if (checked) {
      updatedStyles = [...serviceStyles, style];
    } else {
      updatedStyles = serviceStyles.filter(s => s !== style);
    }
    
    onServiceStyleChange(updatedStyles);
  };

  const serviceStyleDescriptions = {
    buffet: "Self-service setup where guests serve themselves from shared food stations",
    plated: "Individual meals served directly to each guest at their table",
    passed_appetizers: "Staff circulate with bite-sized appetizers on trays",
    boxed_individual: "Pre-packaged individual meals for each guest (grab-and-go style)",
    food_stations: "Multiple themed food stations allowing guests to customize their experience"
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <Label className="block">Service Styles</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Select all service styles you offer. Customers will choose one when booking.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-gray-500 mb-4">Select all styles that you offer (customers will select one when booking)</p>
      <div className="grid grid-cols-1 gap-3">
        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="buffet" 
              checked={serviceStyles.includes('buffet')} 
              onCheckedChange={(checked) => handleServiceStyleChange('buffet', checked === true)}
            />
            <Label htmlFor="buffet" className="flex-1">Buffet</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{serviceStyleDescriptions.buffet}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="plated" 
              checked={serviceStyles.includes('plated')} 
              onCheckedChange={(checked) => handleServiceStyleChange('plated', checked === true)}
            />
            <Label htmlFor="plated" className="flex-1">Plated</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{serviceStyleDescriptions.plated}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="passed_appetizers" 
              checked={serviceStyles.includes('passed_appetizers')} 
              onCheckedChange={(checked) => handleServiceStyleChange('passed_appetizers', checked === true)}
            />
            <Label htmlFor="passed_appetizers" className="flex-1">Passed Appetizers</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{serviceStyleDescriptions.passed_appetizers}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="boxed_individual" 
              checked={serviceStyles.includes('boxed_individual')} 
              onCheckedChange={(checked) => handleServiceStyleChange('boxed_individual', checked === true)}
            />
            <Label htmlFor="boxed_individual" className="flex-1">Boxed Individual</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{serviceStyleDescriptions.boxed_individual}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <TooltipProvider>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="food_stations" 
              checked={serviceStyles.includes('food_stations')} 
              onCheckedChange={(checked) => handleServiceStyleChange('food_stations', checked === true)}
            />
            <Label htmlFor="food_stations" className="flex-1">Food Stations</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{serviceStyleDescriptions.food_stations}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      {serviceStyles.length === 0 && (
        <p className="text-sm text-red-500 mt-1">You must select at least one service style</p>
      )}
    </div>
  );
};

export default CateringServiceStyles;
