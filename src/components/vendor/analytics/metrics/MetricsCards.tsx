
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronUp, Star, Flag, Award, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { useVendorAnalytics } from '@/hooks/vendor/use-vendor-analytics';

const MetricsCards: React.FC = () => {
  const { metrics, loading } = useVendorAnalytics();
  console.log(JSON.stringify(metrics));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold">
                  {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : '0.0'}
                </p>
            
              </div>

              <p className="text-xs text-green-600 flex items-center">
              <ChevronUp className="h-3 w-3" />
                {metrics.totalAllReviews} {metrics.totalAllReviews === 0 || metrics.totalAllReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Fulfilled Orders</p>
              <p className="text-3xl font-bold">{metrics.fulfilledOrders}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {metrics.fulfilledOrders > 0 ? 'Trending upward' : 'Get started with your first order'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Flag className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-3xl font-bold">  {metrics.commissionRate > 0 
                  ? (() => {
                      // If value is <= 1, it's decimal format, convert to percentage
                      // If value > 1, it's already percentage format
                      const rate = metrics.commissionRate <= 1 
                        ? metrics.commissionRate * 100 
                        : metrics.commissionRate;
                      return rate.toFixed(2);
                    })()
                  : '0.00'
                }%</p>
              <p className="text-xs text-green-600 flex items-center">
                <ChevronUp className="h-3 w-3" />
              Platform commission rate
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Award className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {metrics.totalEarnings > 0 ? `Earnings: $${metrics.totalEarnings.toLocaleString()}` : 'Start earning today'}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsCards;
