
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Calendar, Star, Package } from 'lucide-react';
import { useVendorDashboard } from '@/hooks/vendor/use-vendor-dashboard';


const VendorSalesMetrics: React.FC = () => {
  const { metrics, loading } = useVendorDashboard();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const MetricCard = ({ icon: Icon, title, value, trend, color }: {
    icon: any;
    title: string;
    value: string;
    trend?: string;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
          </div>
          <Icon className={`h-8 w-8 ${color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={Package}
          title="Total Services"
          value={metrics.totalServices.toString()}
          color="text-blue-600"
        />
        
        <MetricCard
          icon={Package}
          title="Active Services"
          value={metrics.activeServices.toString()}
          color="text-green-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={Package}
          title="Pending Approval"
          value={metrics.pendingServices.toString()}
          color="text-orange-600"
        />
        
        <MetricCard
          icon={Star}
          title="Average Rating"
          value={typeof metrics.avgRating === 'number' ? metrics.avgRating.toFixed(1) : '0.0'}
          color="text-yellow-600"
        />
      </div>
    </div>
  );
};

export default VendorSalesMetrics;
