
import React from 'react';
import { BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Bar } from 'recharts';
import { useVendorPerformance } from '@/hooks/vendor/use-vendor-performance';

export const CustomerDemographics: React.FC = () => {
  const { customerData, loading } = useVendorPerformance();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!customerData || customerData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No customer data available yet. Complete some orders to see demographics.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={customerData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip formatter={(value) => `${value}%`} />
        <Bar dataKey="value" fill="#F07712" name="Percentage" />
      </BarChart>
    </ResponsiveContainer>
  );
};
