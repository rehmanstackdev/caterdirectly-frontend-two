import React from 'react';
import { Navigate } from 'react-router-dom';
import { useVendorPermissions } from '@/contexts/VendorPermissionsContext';

interface VendorTabGuardProps {
  tabId: string;
  children: React.ReactNode;
}

const VendorTabGuard: React.FC<VendorTabGuardProps> = ({ tabId, children }) => {
  const { allowedTabs, loading } = useVendorPermissions();

  if (loading) {
    return <>{children}</>;
  }

  if (!allowedTabs.includes(tabId)) {
    return <Navigate to="/vendor/dashboard" replace />;
  }

  return <>{children}</>;
};

export default VendorTabGuard;
