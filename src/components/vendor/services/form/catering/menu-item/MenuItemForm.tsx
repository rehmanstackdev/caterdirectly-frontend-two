import React from 'react';
import { MenuItem } from '@/types/service-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from '@/components/ui/label';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from "lucide-react";
import { ComboItemForm } from '../combo-item';
import { MenuItemBasicInfo } from './MenuItemBasicInfo';
import { MenuItemImage } from './MenuItemImage';
import { MenuItemPricing } from './MenuItemPricing';
import { MenuItemCategory } from './MenuItemCategory';
import { MenuItemDietaryOptions } from './MenuItemDietaryOptions';
import { MenuItemAllergens } from './MenuItemAllergens';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useMenuItemForm } from './hooks/useMenuItemForm';
import { MenuItemFormActions } from './MenuItemFormActions';
import { MenuItemToggleCombo } from './MenuItemToggleCombo';
import { v4 as uuidv4 } from 'uuid';

interface MenuItemFormProps {
  menuItem?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
  categories: string[];
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  menuItem,
  onSave,
  onCancel,
  categories
}) => {
  const {
    form,
    isCombo: formIsCombo,
    handleToggleCombo: formHandleToggleCombo,
    onSubmit,
    handleSubmit,
    isValid,
    errors
  } = useMenuItemForm({ menuItem, onSave, onCancel });

  const [isCombo, setIsCombo] = React.useState(menuItem?.isCombo || false);

  // When menuItem changes, update the combo state
  React.useEffect(() => {
    if (menuItem?.isCombo !== undefined) {
      setIsCombo(menuItem.isCombo);
    }
  }, [menuItem?.isCombo]);

  const handleToggleCombo = (checked: boolean) => {
    setIsCombo(checked);
    formHandleToggleCombo(checked);
  };

  // If we're in combo mode, display the combo item form
  if (isCombo) {
    return (
      <Card className="border border-orange-200">
        <CardContent className="pt-6">
          <MenuItemToggleCombo 
            isCombo={isCombo}
            onToggleCombo={handleToggleCombo}
          />
          <ComboItemForm
            menuItem={{
              id: menuItem?.id || uuidv4(),
              name: form.watch('name') || '',
              description: form.watch('description') || '',
              price: form.watch('price') || 0,
              priceType: 'per_person', // Default price type for combo
              category: form.watch('category') || '',
              image: menuItem?.image,
              isCombo: true,
              comboCategories: menuItem?.comboCategories || []
            }}
            onSave={(comboItem) => {
              // When saving a combo, ensure it's marked as combo and has the right structure
              const comboData = {
                ...comboItem,
                isCombo: true,
                priceType: 'per_person' as const
              };
              onSave(comboData);
            }}
            onCancel={onCancel}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-orange-200">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <MenuItemToggleCombo 
              isCombo={isCombo}
              onToggleCombo={handleToggleCombo}
            />

            <MenuItemBasicInfo
              form={form}
            />

            <MenuItemImage 
              form={form}
            />

            <MenuItemPricing 
              form={form}
            />

            <MenuItemCategory 
              form={form}
              categories={categories}
            />

            <FormField
              control={form.control}
              name="dietaryFlags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MenuItemDietaryOptions 
                      selectedOptions={field.value || []}
                      onChange={(options) => { field.onChange(options); form.setValue('dietaryNone', false, { shouldValidate: true }); }}
                      noneSelected={form.watch('dietaryNone')}
                      onNoneChange={(val) => { form.setValue('dietaryNone', val, { shouldValidate: true }); if (val) field.onChange([]); }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergenFlags"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MenuItemAllergens 
                      selectedAllergens={field.value || []}
                      onChange={(allergens) => { field.onChange(allergens); form.setValue('allergenNone', false, { shouldValidate: true }); }}
                      noneSelected={form.watch('allergenNone')}
                      onNoneChange={(val) => { form.setValue('allergenNone', val, { shouldValidate: true }); if (val) field.onChange([]); }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errors?.root?.message && (
              <p className="text-sm font-medium text-destructive">{errors.root.message}</p>
            )}

            <MenuItemFormActions 
              onCancel={onCancel}
              isValid={isValid}
              hasRequiredFields={!!(form.watch('name') && form.watch('price') && form.watch('category'))}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MenuItemForm;
