import { useVendorPreferences } from './use-vendor-preferences';
import { useVendorSettings } from './use-vendor-settings';
import { validateOrder } from '@/utils/vendor-validation';

// Combined hook that provides all vendor business rules functionality
export function useVendorBusinessRules() {
  const preferencesHook = useVendorPreferences();
  const settingsHook = useVendorSettings();

  const loading = preferencesHook.loading || settingsHook.loading;
  const saving = preferencesHook.saving || settingsHook.saving;

  const refetch = () => {
    preferencesHook.refetch();
    settingsHook.refetch();
  };

  return {
    // Preferences (vendor_order_preferences table)
    rules: preferencesHook.rules,
    saveRules: preferencesHook.saveRules,
    deleteRule: preferencesHook.deleteRule,
    
    // Settings (vendors table)
    vendorSettings: settingsHook.vendorSettings,
    saveVendorSettings: settingsHook.saveVendorSettings,
    
    // Combined state
    loading,
    saving,
    refetch,
    
    // Validation utility
    validateOrder
  };
}

// Re-export types for backward compatibility
export type { VendorBusinessRules, VendorSettings } from '@/types/vendor';