
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MenuItemFormValues } from '../validation/form-schemas';

interface MenuItemBasicInfoProps {
  form: UseFormReturn<MenuItemFormValues>;
}

export const MenuItemBasicInfo: React.FC<MenuItemBasicInfoProps> = ({
  form
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Menu Item Name*</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g., Grilled Vegetable Platter"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe the menu item"
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
