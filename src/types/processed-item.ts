/**
 * Centralized type definitions for processed service items
 * All components should use these interfaces instead of raw data
 */

export interface ProcessedServiceItem {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  image: string;
  description: string;
  type: string;
  serviceType: string;
  minQuantity: number;
  isCombo: boolean;
  comboCategories?: ProcessedComboCategory[];
  // Staff-specific fields
  duration?: number;
  hourlyRate?: number;
  // Raw service data (for compatibility)
  rawData: any;
}

export interface ProcessedComboCategory {
  id: string;
  name: string;
  description: string;
  minSelections: number;
  maxSelections: number;
  items: ProcessedComboItem[];
}

export interface ProcessedComboItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  image: string;
}

export interface ProcessedService {
  id: string;
  name: string;
  type: string;
  serviceType: string;
  price: string;
  priceDisplay: string;
  image: string;
  description: string;
  vendorName: string;
  location: string;
  items: ProcessedServiceItem[];
  rawData: any;
}