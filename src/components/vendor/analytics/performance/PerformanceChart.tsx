
import React from 'react';
import { LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import { useVendorPerformance } from '@/hooks/vendor/use-vendor-performance';

export const PerformanceChart: React.FC = () => {
  const { performanceData, loading } = useVendorPerformance();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No performance data available yet. Complete some orders to see your analytics.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={performanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
        <Tooltip />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="orders" 
          stroke="#F07712" 
          name="Total Orders"
          strokeWidth={2} 
          dot={{ r: 3 }}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="completed" 
          stroke="#10B981" 
          name="Completed Orders"
          strokeWidth={2} 
          dot={{ r: 3 }}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="rating" 
          stroke="#FBBF24" 
          name="Avg. Rating"
          strokeWidth={2} 
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
