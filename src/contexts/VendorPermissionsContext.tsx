import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VendorTeamService } from '@/services/api/vendor/vendorTeam.service';

interface VendorPermissionsState {
  allowedTabs: string[];
  role: string | null;
  vendorId: string | null;
  loading: boolean;
  refetch: () => void;
}

const VendorPermissionsContext = createContext<VendorPermissionsState>({
  allowedTabs: [],
  role: null,
  vendorId: null,
  loading: true,
  refetch: () => {},
});

export const useVendorPermissions = () => useContext(VendorPermissionsContext);

export const VendorPermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allowedTabs, setAllowedTabs] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(() => {
    setLoading(true);
    VendorTeamService.getMyPermissions()
      .then((response) => {
        setAllowedTabs(response?.data?.tabs || []);
        setRole(response?.data?.role || null);
        const resolvedVendorId = response?.data?.vendorId || null;
        setVendorId(resolvedVendorId);
        // Store in sessionStorage so hooks outside this context can access it
        if (resolvedVendorId) {
          sessionStorage.setItem('selected_vendor_id', resolvedVendorId);
        }
      })
      .catch(() => {
        // Fallback: allow all tabs if API fails
        setAllowedTabs([
          'dashboard', 'services', 'orders', 'messages',
          'calendar', 'team', 'analytics', 'settings',
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return (
    <VendorPermissionsContext.Provider value={{ allowedTabs, role, vendorId, loading, refetch: fetchPermissions }}>
      {children}
    </VendorPermissionsContext.Provider>
  );
};
