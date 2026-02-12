import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PriceType, ServiceType } from '@/types/service-types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ServicePricingProps {
  formData: {
    type: ServiceType;
    price: string;
    priceType: PriceType;
    minGuests?: number;
    maxGuests?: number;
  };
  updateFormData: (data: Partial<ServicePricingProps['formData']>) => void;
  showErrors?: boolean;
}

const ServicePricing: React.FC<ServicePricingProps> = ({ formData, updateFormData, showErrors = false }) => {
  const showGuestLimits = formData.priceType === 'per_person';

  // Get available price types based on service type
  const getPriceTypeOptions = (): { value: PriceType; label: string }[] => {
    switch (formData.type) {
      case 'venues':
        return [
          { value: 'flat_rate', label: 'Flat Rate' },
          { value: 'per_hour', label: 'Hourly Rate' },
          { value: 'per_person', label: 'Per Person' }
        ];
      case 'party-rentals':
        return [
          { value: 'flat_rate', label: 'Flat Rate' },
          { value: 'per_day', label: 'Daily Rate' },
          { value: 'per_item', label: 'Per Item' }
        ];
      case 'staff':
        return [
          { value: 'per_hour', label: 'Hourly Rate' },
          { value: 'flat_rate', label: 'Flat Rate' }
        ];
      default:
        // Default options if service type doesn't match expected values
        return [
          { value: 'flat_rate', label: 'Flat Rate' },
          { value: 'per_person', label: 'Per Person' },
          { value: 'per_hour', label: 'Hourly Rate' }
        ];
    }
  };

  // Get price type description based on the selected price type
  const getPriceDescription = (): string => {
    switch (formData.priceType) {
      case 'per_person':
        return 'Price per guest';
      case 'per_hour':
        return 'Price per hour';
      case 'per_day':
        return 'Price per day';
      case 'per_item':
        return 'Price per item';
      default:
        return 'Total price for the service';
    }
  };
  
  // Update price type if the current selection isn't valid for the service type
  useEffect(() => {
    const availableOptions = getPriceTypeOptions();
    const currentTypeValid = availableOptions.some(option => option.value === formData.priceType);
    
    if (!currentTypeValid && availableOptions.length > 0) {
      updateFormData({ priceType: availableOptions[0].value });
    }
  }, [formData.type, formData.priceType]);

  // Helpers: sanitize and format currency input
  const sanitizeCurrencyInput = (value: string) => {
    // Keep only digits and a single dot
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    // Limit to two decimals
    const parts = cleaned.split('.');
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 2);
      return parts[0] + '.' + parts[1];
    }
    return cleaned;
  };
  const formatToTwoDecimals = (value: string) => {
    if (value === '' || isNaN(Number(value))) return '';
    return (Math.round(Number(value) * 100) / 100).toFixed(2);
  };

  // Don't render for catering services
  if (formData.type === 'catering') {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Catering Pricing</h3>
        <p className="text-gray-500 mt-2">
          For catering services, pricing is managed at the menu item level.
          Please proceed to the next step to configure your menu items and their individual prices.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="price-type">Pricing Type</Label>
          {showErrors && !formData.priceType && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <RadioGroup
            value={formData.priceType}
            onValueChange={(value) => updateFormData({ priceType: value as PriceType })}
            className="flex flex-col space-y-1"
          >
            {getPriceTypeOptions().map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`price-type-${option.value}`} />
                <Label htmlFor={`price-type-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <p className="text-sm text-gray-500">
          Choose how you want to charge for your service
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="price">Price</Label>
          {showErrors && (!formData.price || formData.price === '') && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="price"
            type="text"
            placeholder="0.00"
            className="pl-7"
            value={formData.price}
            onChange={(e) => updateFormData({ price: sanitizeCurrencyInput(e.target.value) })}
            onBlur={() => updateFormData({ price: formatToTwoDecimals(formData.price) })}
          />
        </div>
        <p className="text-sm text-gray-500">
          {getPriceDescription()}
        </p>
      </div>

      {showGuestLimits && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-guests">Minimum Guests</Label>
            <Input
              id="min-guests"
              type="number"
              placeholder="10"
              value={formData.minGuests || ''}
              onChange={(e) => updateFormData({ minGuests: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
            <p className="text-sm text-gray-500">
              Minimum number of guests required
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max-guests">Maximum Guests</Label>
            <Input
              id="max-guests"
              type="number"
              placeholder="100"
              value={formData.maxGuests || ''}
              onChange={(e) => updateFormData({ maxGuests: e.target.value === '' ? undefined : Number(e.target.value) })}
            />
            <p className="text-sm text-gray-500">
              Maximum number of guests you can accommodate
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePricing;
