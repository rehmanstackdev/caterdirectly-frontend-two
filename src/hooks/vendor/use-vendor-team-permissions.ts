import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

type VendorTeamRole = 'staff' | 'manager' | 'admin' | 'owner';

interface TeamPermissions {
  role: VendorTeamRole | null;
  isOwner: boolean;
  canViewOrders: boolean;
  canManageOrders: boolean;
  canViewServices: boolean;
  canManageServices: boolean;
  canViewTeam: boolean;
  canManageTeam: boolean;
  canViewSettings: boolean;
  canManageSettings: boolean;
  canViewFinancials: boolean;
  loading: boolean;
}

export const useVendorTeamPermissions = (vendorId: string) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<TeamPermissions>({
    role: null,
    isOwner: false,
    canViewOrders: false,
    canManageOrders: false,
    canViewServices: false,
    canManageServices: false,
    canViewTeam: false,
    canManageTeam: false,
    canViewSettings: false,
    canManageSettings: false,
    canViewFinancials: false,
    loading: true
  });

  useEffect(() => {
    if (user && vendorId) {
      checkPermissions();
    }
  }, [user, vendorId]);

  const checkPermissions = async () => {
    try {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('user_id')
        .eq('id', vendorId)
        .maybeSingle();

      const isOwner = vendor?.user_id === user?.id;

      if (isOwner) {
        setPermissions({
          role: 'owner',
          isOwner: true,
          canViewOrders: true,
          canManageOrders: true,
          canViewServices: true,
          canManageServices: true,
          canViewTeam: true,
          canManageTeam: true,
          canViewSettings: true,
          canManageSettings: true,
          canViewFinancials: true,
          loading: false
        });
        return;
      }

      // Cast to any to bypass type checking until Supabase types regenerate
      const { data: teamMember } = await (supabase as any)
        .from('vendor_team_members')
        .select('role, status')
        .eq('vendor_id', vendorId)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!teamMember) {
        setPermissions({
          role: null,
          isOwner: false,
          canViewOrders: false,
          canManageOrders: false,
          canViewServices: false,
          canManageServices: false,
          canViewTeam: false,
          canManageTeam: false,
          canViewSettings: false,
          canManageSettings: false,
          canViewFinancials: false,
          loading: false
        });
        return;
      }

      const role = teamMember.role as VendorTeamRole;

      const rolePermissions = {
        staff: {
          canViewOrders: true,
          canManageOrders: true,
          canViewServices: true,
          canManageServices: false,
          canViewTeam: true,
          canManageTeam: false,
          canViewSettings: false,
          canManageSettings: false,
          canViewFinancials: false
        },
        manager: {
          canViewOrders: true,
          canManageOrders: true,
          canViewServices: true,
          canManageServices: true,
          canViewTeam: true,
          canManageTeam: false,
          canViewSettings: true,
          canManageSettings: false,
          canViewFinancials: true
        },
        admin: {
          canViewOrders: true,
          canManageOrders: true,
          canViewServices: true,
          canManageServices: true,
          canViewTeam: true,
          canManageTeam: true,
          canViewSettings: true,
          canManageSettings: true,
          canViewFinancials: true
        }
      };

      setPermissions({
        role,
        isOwner: false,
        ...rolePermissions[role],
        loading: false
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  };

  return permissions;
};
