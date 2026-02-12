import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

type UserRole = 'admin' | 'super-admin' | 'vendor' | 'event-host' | 'host';

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>('host');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole('host');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user role:', error);
          setUserRole('host');
        } else if (data && data.length > 0) {
          // Handle multiple roles with deterministic precedence
          const roles = data.map(r => r.role) as string[];
          const rolePrecedence: UserRole[] = ['super-admin', 'admin', 'vendor', 'event-host'];
          const resolvedRole = rolePrecedence.find(role => roles.includes(role)) || 'host';
          
          setUserRole(resolvedRole);
          if (roles.length > 1) {
            console.warn(`User has multiple roles [${roles.join(', ')}], resolved to: ${resolvedRole}`);
          }
        } else {
          setUserRole('host');
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
        setUserRole('host');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const isAdmin = userRole === 'admin' || userRole === 'super-admin';
  const isVendor = userRole === 'vendor';
  const canManageProposals = isAdmin || isVendor;

  return {
    userRole,
    loading,
    isAdmin,
    isVendor,
    canManageProposals
  };
}