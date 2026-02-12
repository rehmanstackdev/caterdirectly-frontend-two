/**
 * Stripe Tax Code mapping utilities for different service types
 * Reference: https://stripe.com/docs/tax/tax-codes
 */

export interface TaxableLineItem {
  amount: number;
  reference: string;
  tax_code?: string;
  product_data?: {
    name: string;
    description?: string;
  };
}

/**
 * Maps service types to appropriate Stripe Tax codes
 */
export const getStripeTaxCode = (serviceType: string): string => {
  const normalizedType = serviceType.toLowerCase().replace('-', '_');
  
  switch (normalizedType) {
    case 'catering':
      // Food and beverages are typically taxed as tangible goods (fallback)
      return 'txcd_99999999'; // General - Tangible Goods
    
    case 'party_rentals':
    case 'party_rental':
    case 'rental':
      // Physical rental items are tangible goods
      return 'txcd_99999999'; // General - Tangible Goods
    
    case 'staff':
    case 'staffing':
      // Staffing services are professional services
      return 'txcd_20030000'; // General - Services
    
    case 'venue':
    case 'venues':
      // Venue rental is a service
      return 'txcd_20030000'; // General - Services
    
    default:
      // Default to services for unknown types
      return 'txcd_20030000'; // General - Services
  }
};

/**
 * Creates detailed line items for Stripe Tax calculation
 */
export const createDetailedLineItems = (
  services: any[],
  selectedItems: Record<string, number>,
  serviceFee: number,
  deliveryFee: number,
  adjustmentsTotal: number = 0
): TaxableLineItem[] => {
  const lineItems: TaxableLineItem[] = [];
  
  // Process each service and its selected items
  services.forEach((service, index) => {
    const serviceType = service.serviceType || service.type || '';
    const serviceId = service.id || service.serviceId || `service_${index}`;
    const serviceName = service.name || service.serviceName || `Service ${index + 1}`;
    const taxCode = getStripeTaxCode(serviceType);
    
    // Get service details for menu items/rental items
    const details = service.service_details;
    let items: any[] = [];
    
    if (details) {
      switch (serviceType.toLowerCase()) {
        case 'catering':
          items = details.menuItems || details.catering?.menuItems || details.menu || [];
          break;
        case 'party-rental':
        case 'party-rentals':
          items = details.rentalItems || details.items || details.rental?.items || [];
          break;
        case 'staff':
          items = details.staffServices || details.services || [];
          break;
        case 'venue':
        case 'venues':
          items = details.venueOptions || details.options || [];
          break;
      }
    }
    
    // Track if we've added any items for this service
    let hasItems = false;
    
    // Add individual selected items (menu items, rental items, etc.)
    if (items.length > 0 && selectedItems) {
      Object.entries(selectedItems).forEach(([itemId, quantity]) => {
        if (quantity <= 0 || itemId.endsWith('_duration')) return;
        
        let foundItem: any;
        let actualItemId: string;
        
        // Try with service prefix first
        if (itemId.startsWith(serviceId + '_')) {
          actualItemId = itemId.replace(serviceId + '_', '');
          foundItem = items.find(item => 
            item.id === actualItemId || 
            item.name === actualItemId ||
            item.title === actualItemId
          );
        } else {
          // Try direct match
          actualItemId = itemId;
          foundItem = items.find(item => 
            item.id === itemId || 
            item.name === itemId ||
            item.title === itemId
          );
        }
        
        if (foundItem) {
          const itemPrice = parseFloat(foundItem.price) || 0;
          const minQty = foundItem.minQuantity || 1;
          const effectiveQty = Math.max(quantity, minQty);
          
          // Handle staff duration
          let finalAmount = itemPrice * effectiveQty;
          if (serviceType === 'staff') {
            const detailsForMin = details?.staff || details;
            const serviceMinHours = parseFloat(detailsForMin?.minimumHours) || 1;
            const durationKey = `${actualItemId}_duration`;
            const duration = selectedItems[durationKey] || service.duration || serviceMinHours;
            const effectiveDuration = Math.max(duration, serviceMinHours);
            finalAmount *= effectiveDuration;
          }
          
          if (finalAmount > 0) {
            // Ensure clean string values for product object
            const cleanName = String(foundItem.name || foundItem.title || `${serviceName} - ${actualItemId}`).trim();
            const cleanDescription = String(foundItem.description || `${serviceType} item from ${serviceName}`).trim();
            
            lineItems.push({
              amount: Math.round(finalAmount * 100), // Convert to cents
              reference: `${serviceId}_${actualItemId}`,
              tax_code: taxCode,
            });
            hasItems = true;
          }
        }
      });
    }
    
    // If no items were added but the service has a base price, add the service itself
    if (!hasItems) {
      const basePrice = parseFloat(service.price || service.servicePrice) || 0;
      const quantity = Math.max(1, service.quantity || 1);
      let serviceAmount = basePrice * quantity;
      
      // Apply duration for staff services
      if (serviceType === 'staff' && service.duration) {
        serviceAmount *= Math.max(1, service.duration);
      }
      
      if (serviceAmount > 0) {
        const cleanName = String(serviceName).trim();
        const cleanDescription = String(`${serviceType} service`).trim();
        
        lineItems.push({
          amount: Math.round(serviceAmount * 100), // Convert to cents
          reference: serviceId,
          tax_code: taxCode,
        });
      }
    }
  });
  
  // Add service fee (generally not taxable)
  if (serviceFee > 0) {
    lineItems.push({
      amount: Math.round(serviceFee * 100),
      reference: 'service_fee',
      // No tax code - service fees are typically not taxable
    });
  }
  
  // Note: Delivery fee is handled as shipping_cost in Stripe Tax, not as a line item
  // So we don't add it here
  
  // Add adjustments (if any)
  if (adjustmentsTotal !== 0) {
    lineItems.push({
      amount: Math.round(adjustmentsTotal * 100),
      reference: 'adjustments',
      tax_code: 'txcd_99999999', // Assume adjustments are taxable as goods
    });
  }
  
  return lineItems;
};

/**
 * Validates that line items have required fields for Stripe Tax
 */
export const validateLineItems = (lineItems: TaxableLineItem[]): boolean => {
  return lineItems.every(item => 
    typeof item.amount === 'number' && 
    item.amount >= 0 && 
    typeof item.reference === 'string' && 
    item.reference.length > 0
  );
};