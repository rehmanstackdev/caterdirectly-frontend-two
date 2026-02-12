import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import vendorAnalyticsService from '@/services/api/vendor/analytics.Service';

interface VendorMetrics {
  averageRating: number;
  fulfilledOrders: number;
  completionRate: number;
  totalRevenue: number;
  totalEarnings: number;
  totalReviews: number;
  totalAllReviews: number;
  commissionRate: number;
  platformAverageRating: number;
  platformAverageCompletion: number;
}

export const useVendorAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<VendorMetrics>({
    averageRating: 0,
    fulfilledOrders: 0,
    completionRate: 0,
    totalRevenue: 0,
    totalEarnings: 0,
    totalReviews: 0,
    totalAllReviews: 0,
    commissionRate: 0,
    platformAverageRating: 4.2,
    platformAverageCompletion: 89
  });
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const fetchMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch analytics from backend API
      const analytics = await vendorAnalyticsService.getVendorAnalytics();

      // Extract metrics from analytics response
      const averageRating = analytics.reviews?.averageRating || 0;
      const fulfilledOrders = analytics.orders?.fulfilledOrders || 0;
      const completionRate = analytics.orders?.fulfillmentRate || 0;
      const totalRevenue = analytics.orders?.totalRevenue || 0;
      const totalEarnings = analytics.orders?.totalEarnings || 0;
      const totalReviews = analytics.reviews?.totalReviews || 0;
      const totalAllReviews = analytics.reviews?.totalAllReviews || 0;
      const commissionRate = analytics.vendor?.commissionRate || 0;

      setMetrics({
        averageRating: Math.round(averageRating * 10) / 10,
        fulfilledOrders,
        completionRate: Math.round(completionRate),
        totalRevenue,
        totalEarnings,
        totalReviews,
        totalAllReviews,
        commissionRate,
        platformAverageRating: 4.2,
        platformAverageCompletion: 89
      });

      setAnalyticsData(analytics);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  return {
    metrics,
    loading,
    analyticsData,
    refreshMetrics: fetchMetrics
  };
};