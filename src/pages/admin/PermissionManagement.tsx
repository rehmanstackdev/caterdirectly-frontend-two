import { useEffect, useState } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Shield, Save } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Permission {
  permission_category: string;
  permissions: { enabled: boolean };
}

const PERMISSION_CATEGORIES = [
  { id: 'sales', name: 'Sales', description: 'Proposals, Leads' },
  { id: 'operations', name: 'Operations', description: 'Vendors, Services, Orders, Content' },
  { id: 'accounting', name: 'Accounting', description: 'Finances, Payments' },
  { id: 'support', name: 'Support', description: 'Users, Support Tools' },
];

function PermissionManagement() {
  const { hasPageAccess, loading: permLoading, isSuperAdmin } = useAdminPermissions();
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<{ [userId: string]: Set<string> }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      // Get all admin users (not super-admin)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const userIds = roles.map(r => r.user_id);

      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      setAdminUsers(profiles || []);

      // Load permissions for each user
      const { data: perms, error: permsError } = await supabase
        .from('admin_permissions')
        .select('user_id, permission_category, permissions')
        .in('user_id', userIds);

      if (permsError) throw permsError;

      const permMap: { [userId: string]: Set<string> } = {};
      userIds.forEach(id => {
        permMap[id] = new Set();
      });

      perms?.forEach(p => {
        const permissions = p.permissions as { enabled?: boolean };
        if (permissions?.enabled) {
          permMap[p.user_id].add(p.permission_category);
        }
      });

      setPermissions(permMap);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        title: "Error",
        description: "Failed to load admin users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (userId: string, category: string) => {
    setPermissions(prev => {
      const newPerms = { ...prev };
      if (!newPerms[userId]) {
        newPerms[userId] = new Set();
      }
      
      const userPerms = new Set(newPerms[userId]);
      if (userPerms.has(category)) {
        userPerms.delete(category);
      } else {
        userPerms.add(category);
      }
      newPerms[userId] = userPerms;
      
      return newPerms;
    });
  };

  const savePermissions = async (userId: string) => {
    setSaving(true);
    try {
      const userPerms = permissions[userId] || new Set();

      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete all existing permissions for this user
      await supabase
        .from('admin_permissions')
        .delete()
        .eq('user_id', userId);

      // Insert new permissions
      if (userPerms.size > 0) {
        const { error } = await supabase
          .from('admin_permissions')
          .insert(
            Array.from(userPerms).map(category => ({
              user_id: userId,
              permission_category: category as 'sales' | 'operations' | 'accounting' | 'support' | 'system',
              permissions: { enabled: true },
              granted_by: user.id,
            }))
          );

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (permLoading || loading) {
    return (
      <Dashboard userRole="admin" activeTab="security">
        <div>Loading...</div>
      </Dashboard>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Dashboard userRole="admin" activeTab="security">
        <AccessDenied />
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="security">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Permission Management</h1>
        </div>

        <p className="text-muted-foreground">
          Manage page-level permissions for admin users. Super-admins always have full access.
        </p>

        {adminUsers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No admin users found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {adminUsers.map(user => (
              <Card key={user.id} className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PERMISSION_CATEGORIES.map(cat => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{cat.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {cat.description}
                          </div>
                        </div>
                        <Switch
                          checked={permissions[user.id]?.has(cat.id) || false}
                          onCheckedChange={() => togglePermission(user.id, cat.id)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => savePermissions(user.id)}
                      disabled={saving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Permissions
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Dashboard>
  );
}

export default PermissionManagement;
