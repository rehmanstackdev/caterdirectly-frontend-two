import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CateringServiceStyle } from '@/types/service-types';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceStyleSelectorProps {
  availableStyles: CateringServiceStyle[];
  selectedStyle?: CateringServiceStyle;
  onStyleChange: (style: CateringServiceStyle) => void;
  className?: string;
}

const ServiceStyleSelector = ({
  availableStyles,
  selectedStyle,
  onStyleChange,
  className = ""
}: ServiceStyleSelectorProps) => {
  // Style labels mapping
  const styleLabels: Record<CateringServiceStyle, string> = {
    'buffet': 'Buffet',
    'plated': 'Plated',
    'passed_appetizers': 'Passed Appetizers',
    'boxed_individual': 'Boxed Individual',
    'food_stations': 'Food Stations'
  };

  // Style descriptions
  const styleDescriptions: Record<CateringServiceStyle, string> = {
    'buffet': 'Guests serve themselves from a central display',
    'plated': 'Individual plates served to each guest',
    'passed_appetizers': 'Small bites passed on trays by servers',
    'boxed_individual': 'Individual boxed meals for each guest',
    'food_stations': 'Multiple food stations with different cuisines'
  };

  if (!availableStyles || availableStyles.length === 0) {
    return null;
  }

  // If only one style is available, show it as selected info
  if (availableStyles.length === 1) {
    const style = availableStyles[0];
    useEffect(() => {
      onStyleChange(style);
    }, [style, onStyleChange]);

    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Service Style</Label>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">{styleLabels[style]}</p>
                  <p className="text-sm text-blue-700">{styleDescriptions[style]}</p>
                </div>
                <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Only option
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple styles available - show selection
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-700">Choose Service Style *</Label>
            <p className="text-xs text-gray-500 mt-1">How would you like the food to be served?</p>
          </div>
          
          <RadioGroup
            value={selectedStyle}
            onValueChange={(value) => onStyleChange(value as CateringServiceStyle)}
            className="space-y-2"
          >
            {availableStyles.map((style) => (
              <div key={style} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <RadioGroupItem value={style} id={`style-${style}`} className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor={`style-${style}`} className="cursor-pointer">
                    <div className="font-medium text-gray-900">{styleLabels[style]}</div>
                    <div className="text-sm text-gray-600 mt-1">{styleDescriptions[style]}</div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          {!selectedStyle && (
            <p className="text-sm text-red-500">Please select a service style to continue</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStyleSelector;