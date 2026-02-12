import { ServiceItem } from '@/types/service-types';
import { getDisplayPrice } from './service-utils';

/**
 * Extract numeric value from price string
 * Handles formats like: "$50", "$50/Person", "$50 - $100", "From $50"
 */
export const extractPriceValue = (priceString: string): number | null => {
  if (!priceString) return null;
  
  // Remove common text patterns
  const cleaned = priceString
    .replace(/from/gi, '')
    .replace(/price varies/gi, '')
    .trim();
  
  // Extract first number with dollar sign
  const match = cleaned.match(/\$?\s*(\d+(?:\.\d{2})?)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  return null;
};

/**
 * Calculate commission amount based on service price and commission rate
 */
export const calculateCommission = (
  service: ServiceItem,
  commissionRate: number
): { amount: number; formattedAmount: string } | null => {
  if (!service || commissionRate <= 0) {
    return null;
  }
  
  const displayPrice = getDisplayPrice(service);
  const priceValue = extractPriceValue(displayPrice);
  
  if (priceValue === null || priceValue === 0) {
    return null;
  }
  
  // Multiply commission rate by 100 first (0.0519 becomes 5.19)
  const actualRate = commissionRate * 100;
  const commissionAmount = (priceValue * actualRate) / 100;
  const formattedAmount = `$${commissionAmount.toFixed(2)}`;
  
  return {
    amount: commissionAmount,
    formattedAmount
  };
};

/**
 * Format commission rate for display
 */
export const formatCommissionRate = (rate: number): string => {
  // Multiply by 100 to convert 0.0519 to 5.19%
  const displayRate = (rate * 100).toFixed(2);
  return `${displayRate}%`;
};
