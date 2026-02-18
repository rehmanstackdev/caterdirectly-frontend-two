import Dashboard from "@/components/dashboard/Dashboard";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { HostTableHeader } from "@/components/admin/hosts/HostTableHeader";
import { HostTable } from "@/components/admin/hosts/HostTable";
import { useHostManagement } from "@/hooks/admin/hosts";

const HostsManagment = () => {
  const { hasPageAccess, loading: permLoading } = useAdminPermissions();
  const {
    hosts,
    loading,
    searchQuery,
    setSearchQuery,
    updateCommissionRate,
    createNewHost,
  } = useHostManagement();

  if (permLoading) {
    return (
      <Dashboard userRole="admin" activeTab="hosts">
        <div>Loading permissions...</div>
      </Dashboard>
    );
  }

  if (!hasPageAccess("hosts")) {
    return (
      <Dashboard userRole="admin" activeTab="hosts">
        <AccessDenied />
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="hosts">
      <div className="space-y-6">
        <HostTableHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          createNewHost={createNewHost}
        />

        <HostTable
          loading={loading}
          filteredHosts={hosts}
          updateCommissionRate={updateCommissionRate}
        />
      </div>
    </Dashboard>
  );
};

export default HostsManagment;
