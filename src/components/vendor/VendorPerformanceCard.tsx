import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star,
  AlertTriangle
} from 'lucide-react';

interface VendorPerformanceCardProps {
  performanceScore: number;
  orderAcceptanceStats: {
    total_requests: number;
    accepted: number;
    declined: number;
    response_time_avg: number;
  };
  disputeRate?: number;
  averageRating?: number;
  totalReviews?: number;
}

const VendorPerformanceCard: React.FC<VendorPerformanceCardProps> = ({
  performanceScore,
  orderAcceptanceStats,
  disputeRate = 0,
  averageRating = 0,
  totalReviews = 0
}) => {
  const acceptanceRate = orderAcceptanceStats.total_requests > 0 
    ? (orderAcceptanceStats.accepted / orderAcceptanceStats.total_requests) * 100 
    : 0;

  const getPerformanceLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 60) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 40) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { level: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const performance = getPerformanceLevel(performanceScore);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Performance Overview</h3>
        <Badge className={`${performance.bgColor} ${performance.color} border-0`}>
          {performance.level}
        </Badge>
      </div>

      {/* Overall Performance Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Performance Score</span>
          <span className="text-2xl font-bold">{performanceScore.toFixed(1)}/100</span>
        </div>
        <Progress value={performanceScore} className="h-2" />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Order Acceptance Rate */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {acceptanceRate >= 80 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : acceptanceRate >= 60 ? (
              <Clock className="w-4 h-4 text-yellow-600" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-xs font-medium">Acceptance Rate</span>
          </div>
          <p className="text-lg font-semibold">{acceptanceRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">
            {orderAcceptanceStats.accepted}/{orderAcceptanceStats.total_requests} orders
          </p>
        </div>

        {/* Response Time */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium">Avg Response</span>
          </div>
          <p className="text-lg font-semibold">
            {orderAcceptanceStats.response_time_avg.toFixed(1)}h
          </p>
          <p className="text-xs text-gray-500">
            {orderAcceptanceStats.response_time_avg < 2 ? 'Excellent' : 
             orderAcceptanceStats.response_time_avg < 6 ? 'Good' : 'Slow'}
          </p>
        </div>

        {/* Customer Rating */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-medium">Customer Rating</span>
          </div>
          <p className="text-lg font-semibold">{averageRating.toFixed(1)}/5.0</p>
          <p className="text-xs text-gray-500">{totalReviews} reviews</p>
        </div>

        {/* Dispute Rate */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {disputeRate < 5 ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-xs font-medium">Dispute Rate</span>
          </div>
          <p className="text-lg font-semibold">{disputeRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">
            {disputeRate < 2 ? 'Excellent' : 
             disputeRate < 5 ? 'Good' : 'High'}
          </p>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">How to Improve:</h4>
        <div className="space-y-1 text-xs">
          {acceptanceRate < 80 && (
            <div className="flex items-center gap-2 text-yellow-600">
              <TrendingUp className="w-3 h-3" />
              <span>Accept more orders to improve ranking</span>
            </div>
          )}
          {orderAcceptanceStats.response_time_avg > 6 && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-3 h-3" />
              <span>Respond faster to order requests</span>
            </div>
          )}
          {disputeRate > 5 && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-3 h-3" />
              <span>Focus on quality to reduce disputes</span>
            </div>
          )}
          {averageRating < 4.0 && (
            <div className="flex items-center gap-2 text-blue-600">
              <Star className="w-3 h-3" />
              <span>Improve service quality for better ratings</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VendorPerformanceCard;