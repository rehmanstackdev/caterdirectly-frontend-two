

import { Card, CardContent } from "@/components/ui/card";
import { Users, Building2, ShoppingBag, DollarSign } from "lucide-react";
import { useAdminDashboardStats } from "@/hooks/use-admin-dashboard";

const RealPlatformStats = () => {
  const { data: stats, isLoading, error } = useAdminDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-500">Error loading dashboard statistics</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-3xl font-bold">{stats?.totalUsers?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <Users className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vendors</p>
              <p className="text-3xl font-bold">{stats?.totalVendors?.toLocaleString() || '0'}</p>
              <p className="text-xs text-gray-400">
                {stats?.approvedVendors || 0} approved, {stats?.pendingVendors || 0} pending
              </p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <Building2 className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-3xl font-bold">{stats?.totalBookings?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <ShoppingBag className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</p>
            </div>
            <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
              <DollarSign className="h-6 w-6 text-[rgba(240,119,18,1)]" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealPlatformStats;
