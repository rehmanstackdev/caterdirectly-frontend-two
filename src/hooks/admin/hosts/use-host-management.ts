import { useHostsData } from "./use-hosts-data";
import { useHostFilters } from "./use-host-filters";
import { useHostActions } from "./use-host-actions";
import { useHostNavigation } from "./use-host-navigation";

export function useHostManagement() {
  const { hosts, loading, setHosts } = useHostsData();
  const { searchQuery, setSearchQuery, filteredHosts } = useHostFilters(hosts);
  const { updateHostStatus, updateCommissionRate, deleteHost } = useHostActions(setHosts, hosts);
  const { createNewHost, navigate } = useHostNavigation();

  return {
    hosts: filteredHosts,
    loading,
    searchQuery,
    setSearchQuery,
    updateHostStatus,
    updateCommissionRate,
    deleteHost,
    createNewHost,
    navigate,
  };
}
