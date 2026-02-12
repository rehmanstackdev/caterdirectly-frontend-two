
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { PartyRentalServiceDetails as RentalDetails } from '@/types/service-types';

interface PartyRentalServiceDetailsProps {
  formData: Partial<RentalDetails>;
  updateFormData: (data: Partial<RentalDetails>) => void;
}

const PartyRentalServiceDetails: React.FC<PartyRentalServiceDetailsProps> = ({ formData, updateFormData }) => {
  // Log the formData to help with debugging
  useEffect(() => {
    console.log('=== PARTY RENTAL COMPONENT DEBUG ===');
    console.log('PartyRentalServiceDetails formData:', formData);
    console.log('deliveryOptions:', formData.deliveryOptions);
    console.log('deliveryOptions type:', typeof formData.deliveryOptions);
    console.log('deliveryOptions isArray:', Array.isArray(formData.deliveryOptions));
    console.log('=== END COMPONENT DEBUG ===');
  }, [formData]);

  // Create a safe update method to ensure we're properly updating data
  const safeUpdateFormData = (key: string, value: any) => {
    console.log(`PartyRentalServiceDetails updating ${key}:`, value);
    const update = { [key]: value };
    updateFormData(update);
  };

  const handleSwitchChange = (checked: boolean) => {
    safeUpdateFormData('setupRequired', checked);
  };

  const handleSetupFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseFloat(value) || 0;
    console.log('Setup fee input value:', value, 'parsed as:', parsedValue);
    safeUpdateFormData('setupFee', parsedValue);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = parseInt(value) || 1;
    console.log('Quantity input value:', value, 'parsed as:', parsedValue);
    safeUpdateFormData('availableQuantity', parsedValue);
  };

  const handleDeliveryOptionChange = (option: string, checked: boolean) => {
    const currentOptions = formData.deliveryOptions || [];
    const newOptions = checked
      ? [...currentOptions, option]
      : currentOptions.filter(o => o !== option);
    
    console.log('Delivery options updated:', newOptions);
    safeUpdateFormData('deliveryOptions', newOptions);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="setup-required">Setup Required</Label>
          <p className="text-sm text-gray-500">Does your rental require setup by your team?</p>
        </div>
        <Switch
          id="setup-required"
          checked={formData.setupRequired || false}
          onCheckedChange={handleSwitchChange}
        />
      </div>
      
      {formData.setupRequired && (
        <div>
          <Label htmlFor="setup-fee">Setup Fee ($)</Label>
          <Input
            id="setup-fee"
            type="number"
            placeholder="50"
            value={formData.setupFee !== undefined ? formData.setupFee : ''}
            onChange={handleSetupFeeChange}
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="available-quantity">Available Quantity</Label>
        <Input
          id="available-quantity"
          type="number"
          placeholder="10"
          value={formData.availableQuantity !== undefined ? formData.availableQuantity : ''}
          onChange={handleQuantityChange}
        />
        <p className="text-sm text-gray-500 mt-1">How many units do you have available?</p>
      </div>
      
      <div>
        <Label className="mb-2 block">Delivery Options</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="delivery" 
              checked={(formData.deliveryOptions || []).includes('delivery')}
              onCheckedChange={(checked) => 
                handleDeliveryOptionChange('delivery', checked === true)
              }
            />
            <Label htmlFor="delivery">Delivery Available</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pickup" 
              checked={(formData.deliveryOptions || []).includes('pickup')}
              onCheckedChange={(checked) => 
                handleDeliveryOptionChange('pickup', checked === true)
              }
            />
            <Label htmlFor="pickup">Customer Pickup Available</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyRentalServiceDetails;
