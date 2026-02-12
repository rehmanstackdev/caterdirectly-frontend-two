import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PackagingOptions } from '@/types/service-types';

interface PackagingOptionsFormProps {
  packagingOptions: PackagingOptions;
  onUpdate: (options: PackagingOptions) => void;
}

const PackagingOptionsForm: React.FC<PackagingOptionsFormProps> = ({
  packagingOptions,
  onUpdate
}) => {
  const options = React.useMemo(() => ({
    disposable: false,
    disposableFee: 0,
    reusable: false,
    reusableFeeType: 'flat_rate' as const,
    reusableServiceFeePercentage: 0,
    reusableServiceFeeFlatRate: 0,
    ...packagingOptions
  }), [packagingOptions]);

  const handleToggleOption = (option: keyof PackagingOptions, checked: boolean) => {
    const updatedOptions = { ...options, [option]: checked };
    onUpdate(updatedOptions);
  };

  const handleFeeChange = (option: keyof PackagingOptions, value: number) => {
    const updatedOptions = { ...options, [option]: value };
    onUpdate(updatedOptions);
  };

  const handleFeeTypeChange = (feeType: 'percentage' | 'flat_rate') => {
    const updatedOptions = { 
      ...options, 
      reusableFeeType: feeType,
      // Reset the other fee value when switching types
      ...(feeType === 'percentage' 
        ? { reusableServiceFeeFlatRate: 0 }
        : { reusableServiceFeePercentage: 0 }
      )
    };
    onUpdate(updatedOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Packaging Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-6">
          {/* Disposable Packaging */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disposable"
                checked={options.disposable}
                onCheckedChange={(checked) => handleToggleOption('disposable', checked === true)}
              />
              <Label htmlFor="disposable" className="text-sm font-medium">
                Offer Disposable Packaging
              </Label>
            </div>
            {options.disposable && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="disposable-fee" className="text-sm text-gray-600">
                  Additional Fee (per person)
                </Label>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="disposable-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={options.disposableFee || ''}
                      onChange={(e) => handleFeeChange('disposableFee', parseFloat(e.target.value) || 0)}
                      className="pl-7 w-32"
                    />
                  </div>
                  <span className="text-sm text-gray-500">per person</span>
                </div>
              </div>
            )}
          </div>

          {/* Reusable Packaging */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reusable"
                checked={options.reusable}
                onCheckedChange={(checked) => handleToggleOption('reusable', checked === true)}
              />
              <Label htmlFor="reusable" className="text-sm font-medium">
                Offer Reusable Packaging
              </Label>
            </div>
            {options.reusable && (
              <div className="ml-6 space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Setup and Pickup Service Fee
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Includes delivery, setup, and pickup of reusable items like chafing trays
                  </p>
                  
                  <RadioGroup 
                    value={options.reusableFeeType || 'flat_rate'} 
                    onValueChange={handleFeeTypeChange}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flat_rate" id="flat-rate" />
                      <Label htmlFor="flat-rate" className="text-sm">Flat Rate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage" className="text-sm">Percentage of Order</Label>
                    </div>
                  </RadioGroup>
                  
                  {options.reusableFeeType === 'flat_rate' && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="flat-rate-amount" className="text-sm">
                        Amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                        <Input
                          id="flat-rate-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={options.reusableServiceFeeFlatRate || ''}
                          onChange={(e) => handleFeeChange('reusableServiceFeeFlatRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="pl-7 w-32"
                        />
                      </div>
                    </div>
                  )}
                  
                  {options.reusableFeeType === 'percentage' && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="percentage-amount" className="text-sm">
                        Percentage
                      </Label>
                      <div className="relative">
                        <Input
                          id="percentage-amount"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={options.reusableServiceFeePercentage || ''}
                          onChange={(e) => handleFeeChange('reusableServiceFeePercentage', parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                          className="w-24"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackagingOptionsForm;