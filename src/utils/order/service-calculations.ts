
import { ServiceSelection } from "@/types/order";
import { calculateServiceTotal as unifiedCalculateServiceTotal } from "../unified-calculations";

/**
 * Calculates the total price for a service using the unified calculation system
 * @param service The service selection object
 * @param selectedItems Record of itemId -> quantity for selected items
 * @returns The total price for the service
 */
export const calculateServiceTotal = (service: ServiceSelection, selectedItems: Record<string, number> = {}): number => {
  // Use the unified calculation system for consistency across the app
  return unifiedCalculateServiceTotal(service, selectedItems);
};
