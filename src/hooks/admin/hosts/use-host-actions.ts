import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import { toast } from "sonner";
import hostsService from "@/services/api/admin/hosts.Service";
import { HostStatus } from "./types";

export function useHostActions(setHosts: (updater: (prev: any[]) => any[]) => void, hosts: any[]) {
  const { hasPermission } = useAdminPermissions();

  const updateHostStatus = async (hostId: string, status: HostStatus) => {
    if (!hasPermission("users", "update")) {
      toast.error("You don't have permission to update host status");
      return;
    }

    try {
      const result = await hostsService.updateHostStatus(hostId, status);

      setHosts((prev) =>
        prev.map((host) => (host.id === hostId ? { ...host, status } : host)),
      );

      toast.success(result?.message || `Host status updated to ${status}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to update host status";
      toast.error(errorMessage);
    }
  };

  const updateCommissionRate = async (hostId: string, rate: number) => {
    if (!hasPermission("users", "update")) {
      toast.error("You don't have permission to update host commission rate");
      return;
    }

    try {
      const result = await hostsService.updateHostCommissionRate(hostId, rate);

      setHosts((prev) =>
        prev.map((host) =>
          host.id === hostId ? { ...host, commission_rate: rate, commissionRate: rate } : host,
        ),
      );

      toast.success(result?.message || `Host commission updated to ${rate}%`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to update host commission rate";
      toast.error(errorMessage);
    }
  };

  const deleteHost = async (hostId: string) => {
    if (!hasPermission("users", "delete")) {
      toast.error("You don't have permission to delete hosts");
      return;
    }

    try {
      const hostToDelete = hosts.find((h) => h.id === hostId);
      if (!hostToDelete?.userId) {
        throw new Error("Host user ID not found");
      }

      await hostsService.deleteHost(hostToDelete.userId);
      setHosts((prev) => prev.filter((host) => host.id !== hostId));
      toast.success("Host deleted successfully");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to delete host";
      toast.error(errorMessage);
    }
  };

  return {
    updateHostStatus,
    updateCommissionRate,
    deleteHost,
  };
}
