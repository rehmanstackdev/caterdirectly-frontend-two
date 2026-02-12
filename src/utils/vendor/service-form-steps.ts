
/**
 * Determines the total number of steps based on service type
 * Catering services have 6 steps, other services have 5 steps
 */
export const getTotalSteps = (serviceType: string): number => {
  return serviceType === 'catering' ? 6 : 5;
};

/**
 * Get step name based on current step and service type
 */
export const getStepName = (step: number, serviceType: string): string => {
  const isCatering = serviceType === 'catering';
  
  switch (step) {
    case 1:
      return 'Basic Information';
    case 2:
      return isCatering ? 'Menu Items' : 'Pricing';
    case 3:
      return isCatering ? 'Packaging' : 'Service Details';
    case 4:
      return isCatering ? 'Delivery' : 'Media';
    case 5:
      return isCatering ? 'Additions' : 'Review & Submit';
    case 6:
      return 'Review & Submit';
    default:
      return `Step ${step}`;
  }
};

/**
 * Maps the visual step number to the actual step in the process
 */
export const getDisplayStep = (currentStep: number, serviceType: string): number => {
  return currentStep;
};
