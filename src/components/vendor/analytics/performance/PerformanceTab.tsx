
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PerformanceChart } from './PerformanceChart';
import { CustomerDemographics } from './CustomerDemographics';
import { useVendorAnalytics } from '@/hooks/vendor/use-vendor-analytics';

const PerformanceTab: React.FC = () => {
  const { analyticsData, loading } = useVendorAnalytics();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>
          Track your key performance indicators over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold">{analyticsData?.reviews?.averageRating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-gray-500 mt-1">Based on {analyticsData?.reviews?.totalReviews || 0} reviews</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Fulfillment Rate</p>
                <p className="text-2xl font-bold">{analyticsData?.orders?.fulfillmentRate?.toFixed(1) || '0.0'}%</p>
                <p className="text-xs text-gray-500 mt-1">{analyticsData?.orders?.fulfilledOrders || 0} of {analyticsData?.orders?.totalOrders || 0} orders</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">${analyticsData?.orders?.totalRevenue?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500 mt-1">From all fulfilled orders</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">${analyticsData?.orders?.totalEarnings?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500 mt-1">After commission</p>
              </div>
            </div>
            
            {/* <div className="h-[300px]">
              <PerformanceChart />
            </div> */}
            
            {/* <div>
              <h3 className="font-medium mb-3">Customer Demographics</h3>
              <div className="h-[250px]">
                <CustomerDemographics />
              </div>
            </div> */}
          </>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTab;
