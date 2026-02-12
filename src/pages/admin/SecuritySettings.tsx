import { Shield } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";

function SecuritySettings() {
  const { hasPageAccess, loading } = useAdminPermissions();

  if (loading) {
    return (
      <Dashboard userRole="admin" activeTab="security">
        <div>Loading permissions...</div>
      </Dashboard>
    );
  }

  if (!hasPageAccess('security')) {
    return (
      <Dashboard userRole="admin" activeTab="security">
        <AccessDenied />
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="security">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Security Settings</h1>
        
        <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-xl">Security Settings</h2>
            <p className="mt-2 text-gray-500 max-w-md">
              This module will provide tools to manage security settings, including user permissions, access controls, and audit logs.
            </p>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

export default SecuritySettings;
