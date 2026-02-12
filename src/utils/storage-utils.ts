/**
 * Storage utility functions that adapt to development vs production environments
 * Uses sessionStorage for development to reduce localStorage quota usage
 */

/**
 * Get the appropriate storage location based on environment
 */
export const getStorageLocation = (key: string): Storage => {
  // Use sessionStorage for development data to reduce localStorage pressure
  const developmentKeys = ['eventify_services', 'orders', 'events'];
  
  if (process.env.NODE_ENV === 'development' && developmentKeys.includes(key)) {
    return sessionStorage;
  }
  
  return localStorage;
};

/**
 * Safe getItem that checks both sessionStorage and localStorage
 */
export const safeGetItem = (key: string): string | null => {
  // First try the appropriate storage location
  const storage = getStorageLocation(key);
  const value = storage.getItem(key);
  
  if (value) {
    return value;
  }
  
  // Fallback: check the other storage location for backwards compatibility
  const fallbackStorage = storage === sessionStorage ? localStorage : sessionStorage;
  return fallbackStorage.getItem(key);
};

/**
 * Safe setItem that uses the appropriate storage location with StorageManager
 */
export const safeSetStorageItem = async (key: string, value: string): Promise<boolean> => {
  try {
    // Import StorageManager dynamically to avoid circular dependencies
    const { StorageManager } = await import('./storage-manager');
    
    // Use StorageManager for quota-aware storage
    const success = StorageManager.safeSetItem(key, value);
    
    if (!success) {
      console.warn(`[safeSetStorageItem] StorageManager failed for key: ${key}, attempting fallback`);
      // Fallback to direct storage if StorageManager fails
      const storage = getStorageLocation(key);
      storage.setItem(key, value);
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to store ${key}:`, error);
    return false;
  }
};

/**
 * Remove item from both storage locations for cleanup
 */
export const removeFromBothStorages = (key: string): void => {
  try {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key}:`, error);
  }
};