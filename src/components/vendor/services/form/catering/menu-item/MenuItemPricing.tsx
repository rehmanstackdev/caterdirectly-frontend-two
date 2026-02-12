
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DollarSign } from 'lucide-react';
import { MenuItemFormValues } from '../validation/form-schemas';

interface MenuItemPricingProps {
  form: UseFormReturn<MenuItemFormValues>;
}

export const MenuItemPricing: React.FC<MenuItemPricingProps> = ({
  form
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price*</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <DollarSign className="h-4 w-4" />
                </span>
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="0.01"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value === '' ? undefined : parseFloat(value));
                  }}
                  className="pl-8"
                  placeholder="Enter price (e.g., 15.50)"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="minQuantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum order quantity (optional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min="1"
                step="1"
                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                placeholder="e.g., 12"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="priceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price Type*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="per_person" id="per_person" />
                  <Label htmlFor="per_person">Per Person</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="per_platter" id="per_platter" />
                  <Label htmlFor="per_platter">Per Platter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="per_event" id="per_event" />
                  <Label htmlFor="per_event">Per Event</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
