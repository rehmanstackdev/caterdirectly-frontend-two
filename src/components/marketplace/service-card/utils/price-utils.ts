
/**
 * DEPRECATED - Use formatUnifiedServicePrice from unified-price-utils.ts instead
 * This function is kept for backward compatibility only
 */
export const cleanPriceForDisplay = (priceStr: string): string => {
  console.warn('[DEPRECATED] cleanPriceForDisplay is deprecated. Use formatUnifiedServicePrice instead.');
  return priceStr;
};
