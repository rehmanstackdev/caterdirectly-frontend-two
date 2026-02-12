import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

interface BackendDashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalWaitlistEntries: number;
  vendorStatusBreakdown: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  monthlyRevenue: number;
  approvedVendors: number;
  pendingVendors: number;
  waitlistEntries: number;
}

export const useBackendAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['backend-admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('[Dashboard Stats] Fetching from backend API...');
      
      const response = await api.get<{
        status: number;
        response: string;
        message: string;
        data: BackendDashboardStats;
      }>('/users/dashboard/stats');

      console.log('[Dashboard Stats] Backend response:', response);
      const backendData = response.data;

      // Transform backend data to match existing interface
      const transformedData = {
        totalUsers: backendData.totalUsers,
        totalVendors: backendData.totalVendors,
        totalBookings: 0, // Not available in backend yet
        monthlyRevenue: 0, // Not available in backend yet
        approvedVendors: backendData.vendorStatusBreakdown.approved,
        pendingVendors: backendData.vendorStatusBreakdown.pending,
        waitlistEntries: backendData.totalWaitlistEntries
      };
      
      console.log('[Dashboard Stats] Transformed data:', transformedData);
      return transformedData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });
};