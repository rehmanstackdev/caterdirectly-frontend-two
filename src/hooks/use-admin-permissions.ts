import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { PageId } from '@/constants/admin-permissions';
import usersService from '@/services/api/admin/users.Service';

interface PagePermissions {
  [pageId: string]: boolean;
}

interface ApiPermission {
  permission: string;
  enabled: boolean;
}

// Map API permission names to page IDs
const permissionToPageIdMap: { [key: string]: string } = {
  'dashboard': 'dashboard',
  'reports': 'reports',
  'proposals': 'proposals',
  'leads': 'leads',
  'waitlist': 'waitlist',
  'services': 'services',
  'vendors': 'vendors',
  'orders': 'orders',
  'users': 'users',
  'support': 'support',
  'finances': 'finances',
  'invoices': 'invoices',
  'settings': 'config',
  'security': 'security',
};

export function useAdminPermissions() {
  const { user, loading: authLoading, userRole } = useAuth();
  
  // Check if super-admin
  const isSuperAdmin = useMemo(() => {
    return userRole === 'super_admin' || userRole === 'super-admin';
  }, [userRole]);

  // Fetch permissions from API only for regular admin users - cached with React Query
  const { data: permissionsData, isLoading: permissionsLoading, error } = useQuery({
    queryKey: ['admin-permissions', user?.id],
    queryFn: async () => {
      if (!user || !userRole || userRole !== 'admin') {
        return null;
      }
      const response = await usersService.getPermissionsByUserId(user.id);
      return response;
    },
    enabled: !!user && userRole === 'admin' && !isSuperAdmin,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1,
  });

  // Transform permissions data to pagePermissions object
  const pagePermissions = useMemo<PagePermissions>(() => {
    // For super-admin, grant all permissions
    if (isSuperAdmin) {
      return {
        dashboard: true,
        proposals: true,
        leads: true,
        waitlist: true,
        services: true,
        vendors: true,
        users: true,
        orders: true,
        finances: true,
        invoices: true,
        reports: true,
        support: true,
        config: true,
        security: true,
      };
    }

    // For regular admin, process API response
    if (userRole === 'admin' && permissionsData) {
      const permissions: PagePermissions = {};
      
      // Handle different response formats
      const apiPermissions = Array.isArray(permissionsData?.data) 
        ? permissionsData.data 
        : Array.isArray(permissionsData) 
        ? permissionsData 
        : [];
      
      if (apiPermissions.length > 0) {
        apiPermissions.forEach((perm: ApiPermission) => {
          if (perm && typeof perm === 'object' && 'permission' in perm && 'enabled' in perm) {
            const pageId = permissionToPageIdMap[perm.permission];
            if (pageId) {
              permissions[pageId] = perm.enabled;
            }
          }
        });
      }
      
      // Always allow dashboard and reports (default accessible pages)
      permissions.dashboard = true;
      permissions.reports = true;
      
      return permissions;
    }

    // Non-admin users or fallback - limited access
    return {
      dashboard: true,
      reports: true,
    };
  }, [isSuperAdmin, userRole, permissionsData]);

  const hasPageAccess = (pageId: string): boolean => {
    if (isSuperAdmin) return true;
    return pagePermissions[pageId] || false;
  };

  // Backward compatibility: hasPermission(resource, action) always returns true for super-admin
  // For regular admins, it just checks if they have page access
  const hasPermission = (resource: string, action: string): boolean => {
    if (isSuperAdmin) return true;
    // Map old resource names to new page IDs
    const pageMapping: { [key: string]: string } = {
      'vendors': 'vendors',
      'services': 'services',
      'users': 'users',
      'orders': 'orders',
      'proposals': 'proposals',
    };
    const pageId = pageMapping[resource] || resource;
    return hasPageAccess(pageId);
  };

  return {
    hasPageAccess,
    hasPermission, // Backward compatibility
    isSuperAdmin,
    loading: authLoading || (userRole === 'admin' && permissionsLoading),
    pagePermissions,
  };
}
