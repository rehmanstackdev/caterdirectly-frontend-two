
import React from 'react';
import { DeliveryOptions, DeliveryRange } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
// uuid is not used in this file so we've removed the import

interface DeliveryOptionsFormProps {
  deliveryOptions: DeliveryOptions;
  onUpdate: (options: DeliveryOptions) => void;
}

const DeliveryOptionsForm: React.FC<DeliveryOptionsFormProps> = ({
  deliveryOptions,
  onUpdate
}) => {
  // Preset delivery ranges - defines both delivery fees and service area
  const presetRanges = [
    { range: '0-5 miles', fee: 0 },
    { range: '5-25 miles', fee: 0 },
    { range: '25-50 miles', fee: 0 },
    { range: '50-75 miles', fee: 0 },
    { range: '75-100 miles', fee: 0 }
  ];

  // Initialize with default values if not provided
  const options = React.useMemo(() => ({
    delivery: deliveryOptions?.delivery ?? false,
    pickup: deliveryOptions?.pickup ?? true,
    deliveryRanges: deliveryOptions?.deliveryRanges?.length > 0 
      ? deliveryOptions.deliveryRanges 
      : [presetRanges[0]],
    deliveryMinimum: deliveryOptions?.deliveryMinimum ?? undefined
  }), [deliveryOptions]);

  const handleToggleOption = (option: 'delivery' | 'pickup', checked: boolean) => {
    onUpdate({
      ...options,
      [option]: checked
    });
  };


  const handleAddPresetRange = (presetRange: { range: string; fee: number }) => {
    // Check if this range already exists
    const rangeExists = options.deliveryRanges.some(range => range.range === presetRange.range);
    if (!rangeExists) {
      onUpdate({
        ...options,
        deliveryRanges: [...options.deliveryRanges, presetRange]
      });
    }
  };

  const handleUpdateRange = (index: number, field: keyof DeliveryRange, value: any) => {
    const updatedRanges = [...options.deliveryRanges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: value
    };

    onUpdate({
      ...options,
      deliveryRanges: updatedRanges
    });
  };

  const handleRemoveRange = (index: number) => {
    const updatedRanges = options.deliveryRanges.filter((_, i) => i !== index);
    
    onUpdate({
      ...options,
      deliveryRanges: updatedRanges
    });
  };

  const handleMinimumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseCurrencyInput(e.target.value);
    onUpdate({
      ...options,
      deliveryMinimum: val || undefined
    });
  };

  // Currency helpers for fee inputs
  const formatCurrencyDisplay = (value: number) => {
    if (value === undefined || value === null || isNaN(Number(value)) || Number(value) <= 0) return '';
    return `$${(Math.round(Number(value) * 100) / 100).toFixed(2)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Delivery Options</CardTitle>
        <p className="text-sm text-muted-foreground">Set your delivery fees and service area. Customers within your furthest delivery range will be able to book your services.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery-option"
              checked={options.delivery}
              onCheckedChange={(checked) => handleToggleOption('delivery', checked === true)}
            />
            <Label htmlFor="delivery-option">Offer Delivery</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pickup-option"
              checked={options.pickup}
              onCheckedChange={(checked) => handleToggleOption('pickup', checked === true)}
            />
            <Label htmlFor="pickup-option">Offer Pickup</Label>
          </div>
        </div>

        {options.delivery && (
          <>
            <div>
              <Label htmlFor="delivery-minimum">Delivery Minimum ($)</Label>
              <Input
                id="delivery-minimum"
                type="text"
                inputMode="decimal"
                placeholder="$0.00"
                aria-label="Delivery minimum"
                value={formatCurrencyDisplay(options.deliveryMinimum)}
                onChange={handleMinimumChange}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Additional minimum order amount required specifically for delivery orders (leave empty if none)</p>
            </div>

            <div>
              <div className="space-y-3">
                <div>
                  <Label>Delivery Fee Ranges & Service Area</Label>
                  <p className="text-sm text-muted-foreground mt-1">Your service area extends to the furthest delivery range you select (maximum 100 miles).</p>
                </div>

                {/* Preset Range Buttons */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Select delivery ranges (choose all that apply):</p>
                  <div className="flex flex-wrap gap-2">
                    {presetRanges.map((preset, index) => {
                      const exists = options.deliveryRanges.some(range => range.range === preset.range);
                      return (
                        <Button
                          key={index}
                          type="button"
                          variant={exists ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleAddPresetRange(preset)}
                          disabled={exists}
                          className="text-xs"
                        >
                          {exists ? '✓ ' : '+ '}{preset.range}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Current Ranges */}
                <div className="space-y-3">
                  {options.deliveryRanges.map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Range"
                          value={range.range}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="$0.00"
                          aria-label="Delivery fee"
                          value={formatCurrencyDisplay(range.fee)}
                          onChange={(e) => handleUpdateRange(index, 'fee', parseCurrencyInput(e.target.value))}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRange(index)}
                        disabled={options.deliveryRanges.length <= 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryOptionsForm;
