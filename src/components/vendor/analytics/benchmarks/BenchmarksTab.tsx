
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BenchmarkCard from './BenchmarkCard';
import { useVendorBenchmarks } from '@/hooks/vendor/use-vendor-benchmarks';

const BenchmarksTab: React.FC = () => {
  const { benchmarks, loading } = useVendorBenchmarks();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmark Comparison</CardTitle>
        <CardDescription>
          See how your performance compares to platform averages
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : benchmarks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Complete some orders to see benchmark comparisons.
          </div>
        ) : (
          <div className="space-y-6">
            {benchmarks.map((benchmark, index) => (
              <BenchmarkCard key={index} benchmark={benchmark} />
            ))}
            
            {benchmarks.every(b => b.above) && (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="font-medium">Congratulations! Your metrics are above average in most categories.</p>
                <p className="text-sm text-gray-500 mt-1">Keep up the good work to maintain high performance.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BenchmarksTab;
