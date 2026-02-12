
import * as z from 'zod';
import { PriceType, DietaryFlag, AllergenFlag } from '@/types/service-types';

export const menuItemSchema = z.object({
  name: z.string().min(1, "Menu item name is required"),
  description: z.string().optional(),
  // Allow decimal prices instead of only whole numbers - coerce string to number
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  priceType: z.custom<PriceType>((val) => 
    typeof val === 'string' && ['per_person', 'per_platter', 'per_event', 'flat_rate', 'per_hour', 'per_day', 'per_item'].includes(val as string), 
    { message: "Invalid price type" }
  ),
  category: z.string().min(1, "Category is required"),
  isPopular: z.boolean().default(false),
  dietaryFlags: z.array(z.custom<DietaryFlag>()).default([]),
  allergenFlags: z.array(z.custom<AllergenFlag>()).default([]),
  dietaryNone: z.boolean().optional().default(false),
  allergenNone: z.boolean().optional().default(false),
  image: z.string().optional(),
  isCombo: z.boolean().default(false),
  minQuantity: z.number().int().min(1).optional()
}).superRefine((data, ctx) => {
  // Only validate if neither flags are selected AND none is not checked
  if (!data.dietaryNone && (!data.dietaryFlags || data.dietaryFlags.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dietaryFlags'], message: 'Select at least one dietary option or choose None apply' });
  }
  if (!data.allergenNone && (!data.allergenFlags || data.allergenFlags.length === 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['allergenFlags'], message: 'Specify at least one allergen status or choose None apply' });
  }
});

// Define the ComboItem schema for combo menu items
const comboMenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  additionalPrice: z.number().min(0).optional()
});

// Define the ComboCategory schema
const comboCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Category name is required"),
  maxSelections: z.number().min(1, "Maximum selections must be at least 1"),
  items: z.array(comboMenuItemSchema).min(1, "At least one item is required per category")
});

// Define the full comboItemSchema for form validation
export const comboItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Combo name is required"),
  description: z.string().optional(),
  // Allow decimal prices for combo items as well - coerce string to number
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  isCombo: z.literal(true),
  comboCategories: z.array(comboCategorySchema).min(1, "At least one category is required")
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
export type ComboItemFormValues = z.infer<typeof comboItemSchema>;
