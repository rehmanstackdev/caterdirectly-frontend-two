
import { GlassCard } from '@/components/glass-ui/GlassCard';
import { 
  Users, 
  Building2, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getApprovedVendorsDefinition } from '@/constants/vendor';
import dashboardService from '@/services/api/admin/dashboard.Service';

const AdminMetricsGrid = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dashboardService.getDashboardStats();
        console.log('Dashboard Stats Response:', response);
        // Handle different response structures
        const data = response?.data || response;
        console.log('Extracted Stats Data:', data);
        setStats(data);
      } catch (err: any) {
        console.error('Dashboard Stats Error:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <GlassCard className="p-4 sm:p-6 col-span-full">
          <div className="text-center text-red-600">
            <p>Failed to load dashboard stats</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} className="animate-pulse p-4 sm:p-6">
            <div className="h-16 sm:h-20 bg-white/20 rounded"></div>
          </GlassCard>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const metrics = [
    {
      title: 'Total Users',
      value: formatNumber(stats?.totalUsers || 0),
      icon: Users,
      trend: null, // We'd need historical data to calculate trends
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Approved Vendors',
      value: formatNumber(stats?.vendorStatusBreakdown?.approved || 0),
      icon: Building2,
      trend: stats?.vendorStatusBreakdown?.pending ? `${stats.vendorStatusBreakdown.pending} pending` : null,
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50',
      tooltip: getApprovedVendorsDefinition()
    },
    {
      title: 'Total Vendors',
      value: formatNumber(stats?.totalVendors || 0),
      icon: ShoppingBag,
      trend: null,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Beta Waitlist',
      value: formatNumber(stats?.totalWaitlistEntries || 0),
      icon: Mail,
      trend: null,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {metrics.map((metric) => (
        <GlassCard 
          key={metric.title} 
          variant="elevated" 
          hover 
          className="p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {metric.title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold truncate">
                {metric.value}
              </p>
              {metric.trend && (
                <p className="text-xs text-muted-foreground">
                  {metric.trend}
                </p>
              )}
            </div>
            <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${metric.bgColor}`}>
              <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default AdminMetricsGrid;