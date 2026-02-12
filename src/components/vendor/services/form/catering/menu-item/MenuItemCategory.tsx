
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MenuItemFormValues } from '../validation/form-schemas';

interface MenuItemCategoryProps {
  form: UseFormReturn<MenuItemFormValues>;
  categories: string[];
}

export const MenuItemCategory: React.FC<MenuItemCategoryProps> = ({
  form,
  categories
}) => {
  const { control, watch, setValue } = form;
  const isPopular = watch('isPopular');
  
  return (
    <>
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category*</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full p-2 border rounded"
              >
                <option value="">Select a category...</option>
                {categories.map((categoryOption) => (
                  <option key={categoryOption} value={categoryOption}>
                    {categoryOption}
                  </option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="isPopular"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Mark as popular item</FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );
};
