import { useState, useEffect } from "react";
import { toast } from "sonner";
import hostsService from "@/services/api/admin/hosts.Service";
import { HostStatus } from "./types";

export function useHostsData() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function isValidHostStatus(status: string): status is HostStatus {
    return ["pending", "approved", "rejected", "active", "inactive"].includes(status);
  }

  useEffect(() => {
    let isMounted = true;

    const fetchHosts = async () => {
      try {
        setLoading(true);
        const result = await hostsService.getHosts();

        if (result?.status !== 200 || !result?.data) {
          throw new Error(result?.message || "Failed to fetch hosts");
        }

        if (isMounted) {
          const processedHosts = result.data
            .filter((host: any) => {
              const user = host.user || host;
              const email = user?.email || host.email;
              const id = host.id || user?.id;
              return id && email;
            })
            .map((host: any) => {
              const user = host.user || host;
              const fullName = [user?.firstName || user?.first_name, user?.lastName || user?.last_name]
                .filter(Boolean)
                .join(" ")
                .trim();

              return {
                id: host.id || user?.id,
                userId: user?.id || host.userId,
                name: fullName || host.name || "Unknown Host",
                email: user?.email || host.email,
                is_verified: user?.isVerified ?? user?.is_verified ?? false,
                status: isValidHostStatus(host.hostStatus || host.status || "pending")
                  ? (host.hostStatus || host.status)
                  : "pending",
                commission_rate:
                  host.hostCommissionRate != null
                    ? parseFloat(host.hostCommissionRate)
                    : host.commissionRate != null
                      ? parseFloat(host.commissionRate)
                      : null,
                commissionRate:
                  host.hostCommissionRate != null
                    ? parseFloat(host.hostCommissionRate)
                    : host.commissionRate != null
                      ? parseFloat(host.commissionRate)
                      : null,
                event_count: host.eventsCount || host.eventCount || 0,
                created_at: user?.createdAt || host.createdAt,
              };
            });

          setHosts(processedHosts);
        }
      } catch (error: any) {
        if (isMounted) {
          const errorMessage = error?.response?.data?.message || "Failed to load hosts";
          toast.error(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHosts();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    hosts,
    loading,
    setHosts,
  };
}
