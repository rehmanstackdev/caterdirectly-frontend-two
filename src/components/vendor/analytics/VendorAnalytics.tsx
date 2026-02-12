
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsCards from './metrics/MetricsCards';
import PerformanceTab from './performance/PerformanceTab';
import ReviewsTab from './reviews/ReviewsTab';
import BenchmarksTab from './benchmarks/BenchmarksTab';
import BadgesTab from './badges/BadgesTab';

const VendorAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <MetricsCards />
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="badges">Badges & Incentives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>
        
        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
        
        <TabsContent value="benchmarks">
          <BenchmarksTab />
        </TabsContent>
        
        <TabsContent value="badges">
          <BadgesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorAnalytics;
