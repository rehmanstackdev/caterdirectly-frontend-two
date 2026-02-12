
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Benchmark } from '@/hooks/vendor/use-vendor-benchmarks';

interface BenchmarkCardProps {
  benchmark: Benchmark;
}

const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ benchmark }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-2">{benchmark.metric}</h3>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold">{benchmark.value}</p>
          <p className="text-sm text-gray-500">Your Performance</p>
        </div>
        <div>
          <p className="text-xl">{benchmark.benchmark}</p>
          <p className="text-sm text-gray-500">Platform Average</p>
        </div>
        <div>
          <Badge 
            className={benchmark.above 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
            }
          >
            {benchmark.difference}
            {benchmark.above ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkCard;
