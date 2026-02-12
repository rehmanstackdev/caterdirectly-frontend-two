import { getTaxRateByLocation } from './tax-calculation';

/**
 * SINGLE SOURCE OF TRUTH for financial breakdown calculations
 * 
 * This utility provides the correct algebraic back-calculation from stored order totals
 * to derive accurate financial metrics for both vendor payouts and platform earnings.
 * 
 * Formula: T = S × (1 + s + t + s×t) + D
 * Therefore: S = (T - D) / (1 + s + t + s×t)
 * 
 * Where:
 * - T = Total (order.price)
 * - S = Subtotal
 * - D = Delivery fee
 * - s = Service fee rate (5% or 0%)
 * - t = Tax rate (location-based)
 */

export interface OrderFinancialBreakdown {
  // Core amounts
  subtotal: number;
  serviceFee: number;
  tax: number;
  deliveryFee: number;
  commission: number;
  vendorShare: number;          // subtotal - commission - tax
  platformEarnings: number;     // serviceFee + deliveryFee + commission (NOT tax)
  taxWithheld: number;          // tax (goes to government)
  total: number;
  
  // Metadata for verification
  serviceFeeRate: number;
  taxRate: number;
  commissionRate: number;
  location: string;
}

/**
 * Calculate complete financial breakdown from a paid order's stored price
 * 
 * @param order - Order object with price, location, pricing_snapshot, service_details
 * @returns Complete financial breakdown with all components
 */
export function calculateOrderFinancialBreakdown(order: {
  price: number;
  location: string;
  pricing_snapshot?: any;
  service_details?: any;
}): OrderFinancialBreakdown {
  
  // Extract overrides from pricing_snapshot
  const isServiceFeeWaived = order.pricing_snapshot?.overrides?.isServiceFeeWaived ?? false;
  const isTaxExempt = order.pricing_snapshot?.overrides?.isTaxExempt ?? false;
  
  // Get delivery fee from pricing_snapshot or default to 0
  const deliveryFee = order.pricing_snapshot?.deliveryFee ?? 0;
  
  // Get tax rate from location
  const taxInfo = getTaxRateByLocation(order.location || '');
  const taxRate = isTaxExempt ? 0 : taxInfo.rate;
  
  // Service fee rate (5% standard)
  const serviceFeeRate = isServiceFeeWaived ? 0 : 0.05;
  
  // Commission rate (15% standard)
  const commissionRate = 0.15;
  
  // Back-calculate subtotal using algebraic formula
  // T = S × (1 + s + t + s×t) + D
  // Therefore: S = (T - D) / (1 + s + t + s×t)
  const total = order.price;
  const denominator = 1 + serviceFeeRate + taxRate + (serviceFeeRate * taxRate);
  const subtotal = Math.max(0, (total - deliveryFee) / denominator);
  
  // Calculate fees from derived subtotal
  const serviceFee = subtotal * serviceFeeRate;
  const taxableBase = subtotal + serviceFee;
  const tax = taxableBase * taxRate;
  
  // Calculate commission and vendor share
  const commission = subtotal * commissionRate;
  
  // CRITICAL: Tax is withheld from vendor and paid to government
  const vendorShare = subtotal - commission - tax;
  
  // Platform earnings = Service Fee + Delivery + Commission (NOT tax)
  const platformEarnings = serviceFee + deliveryFee + commission;
  
  // Tax goes to government (collected from customer, withheld from vendor)
  const taxWithheld = tax;
  
  return {
    subtotal,
    serviceFee,
    tax,
    deliveryFee,
    commission,
    vendorShare,
    platformEarnings,
    taxWithheld,
    total,
    serviceFeeRate,
    taxRate,
    commissionRate,
    location: order.location || 'Unknown'
  };
}

/**
 * Verify that the calculated breakdown matches the stored total
 * 
 * @param breakdown - Financial breakdown to verify
 * @param tolerance - Maximum acceptable difference (default 0.02 cents)
 * @returns True if verification passes, false otherwise
 */
export function verifyFinancialBreakdown(
  breakdown: OrderFinancialBreakdown,
  tolerance: number = 0.02
): { valid: boolean; difference: number } {
  const calculatedTotal = 
    breakdown.subtotal + 
    breakdown.serviceFee + 
    breakdown.tax + 
    breakdown.deliveryFee;
  
  const difference = Math.abs(calculatedTotal - breakdown.total);
  
  return {
    valid: difference <= tolerance,
    difference
  };
}
