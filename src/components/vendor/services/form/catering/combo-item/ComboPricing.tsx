
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ComboItemFormValues } from './validation/form-schemas';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface ComboPricingProps {
  form: UseFormReturn<ComboItemFormValues>;
}

const ComboPricing: React.FC<ComboPricingProps> = ({ form }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pricing</h3>
      
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem className="max-w-xs">
            <FormLabel>Price Per Person ($)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                placeholder="Enter price (e.g., 15.50)"
                min={0}
                step={0.01}
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <p className="text-sm text-gray-500">
        This price is for the base combo. Additional prices can be set for items in each category.
      </p>
    </div>
  );
};

export default ComboPricing;
