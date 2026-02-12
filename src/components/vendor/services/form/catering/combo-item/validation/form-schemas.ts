
import * as z from 'zod';
import { PriceType } from '@/types/service-types';

// Define the ComboItem schema for combo menu items
const comboMenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  dietaryFlags: z.array(z.string()).optional(),
  allergenFlags: z.array(z.string()).optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().min(0).optional(),
  isPremium: z.boolean().optional(),
  additionalCharge: z.number().min(0).optional()
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
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  isCombo: z.literal(true),
  comboCategories: z.array(comboCategorySchema).min(1, "At least one category is required")
});

export type ComboItemFormValues = z.infer<typeof comboItemSchema>;
