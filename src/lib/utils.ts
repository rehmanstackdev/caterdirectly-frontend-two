
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number or string as currency with proper comma separators
 * @param value - The price value to format (number or string)
 * @param currency - The currency symbol (default: '$')
 * @returns Formatted currency string with commas for thousands and exactly 2 decimal places
 */
export function formatCurrency(value: number | string, currency: string = '$'): string {
  if (value === null || value === undefined || value === '') {
    return `${currency}0.00`;
  }
  
  let numValue: number;
  
  if (typeof value === 'string') {
    // Remove any existing currency symbols and non-numeric characters except decimal point
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    numValue = parseFloat(cleanedValue);
  } else {
    numValue = Number(value);
  }
  
  if (isNaN(numValue) || !isFinite(numValue)) {
    return `${currency}0.00`;
  }
  
  // Ensure exactly 2 decimal places
  return `${currency}${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Computes a grouping key for draft orders to consolidate versions
export function computeDraftGroupKey(input: { name?: string; form_data?: any; date?: string; location?: string }): string {
  const rawName = (input?.name ?? input?.form_data?.name ?? '').toString().trim().toLowerCase();
  const date =
    (input?.date ??
      input?.form_data?.date ??
      input?.form_data?.eventDate ??
      input?.form_data?.event_date ??
      '').toString().trim().toLowerCase();
  const location =
    (input?.location ??
      input?.form_data?.location ??
      input?.form_data?.venue ??
      input?.form_data?.venue_name ??
      '').toString().trim().toLowerCase();
  const parts = [rawName, date, location].filter(Boolean);
  return parts.length ? parts.join('|') : rawName || 'ungrouped';
}

// Enhanced grouping key that also fingerprints selected services for better consolidation
export function computeEnhancedDraftGroupKey(input: { name?: string; form_data?: any; selected_services?: any; selected_items?: any; date?: string; location?: string }): string {
  const name = (input?.name ?? input?.form_data?.name ?? '').toString().trim().toLowerCase();
  const rawDate = (input?.date ?? input?.form_data?.date ?? input?.form_data?.eventDate ?? input?.form_data?.event_date ?? '').toString().trim();
  const date = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : '';
  const location = (input?.location ?? input?.form_data?.location ?? input?.form_data?.venue ?? input?.form_data?.venue_name ?? '').toString().trim().toLowerCase();

  const services = Array.isArray(input?.selected_services)
    ? input.selected_services
    : Array.isArray(input?.form_data?.selected_services)
      ? input.form_data.selected_services
      : [];

  const ids = (services as any[])
    .map((s: any) => (s?.id ?? s?.serviceId ?? s?.service_id ?? s?.slug ?? s?.name ?? '')
      .toString()
      .trim()
      .toLowerCase())
    .filter(Boolean)
    .sort();

  if (!ids.length) {
    return computeDraftGroupKey({ name, form_data: input?.form_data, date, location });
  }

  return [name, date, location, ids.join(',')].filter(Boolean).join('|');
}
