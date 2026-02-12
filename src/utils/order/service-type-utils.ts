
/**
 * Checks if a service type requires item selection before showing pricing
 * @param serviceType The service type
 * @returns True if the service requires item selection
 */
export const requiresItemSelection = (serviceType: string): boolean => {
  const type = serviceType?.toLowerCase();
  return type === 'catering' || type === 'party-rental' || type === 'party-rentals';
};

/**
 * Detects if a service is a staff service based on type or name
 * @param service The service selection object  
 * @returns True if this is a staff service
 */
export const isStaffService = (service: { serviceType?: string; type?: string; name?: string }): boolean => {
  const serviceType = service.serviceType || service.type || '';
  const serviceName = service.name || '';
  
  // Check by explicit service type
  if (serviceType?.toLowerCase() === 'staff') {
    return true;
  }
  
  // Check by service name patterns for staff services
  const staffNames = ['bartender', 'server', 'waiter', 'waitress', 'coordinator', 'host', 'hostess'];
  return staffNames.some(staffName => 
    serviceName.toLowerCase().includes(staffName.toLowerCase())
  );
};
