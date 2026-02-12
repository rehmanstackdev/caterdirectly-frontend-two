
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { useVendorAnalytics } from '@/hooks/vendor/use-vendor-analytics';

const ReviewsTab: React.FC = () => {
  const { analyticsData, loading } = useVendorAnalytics();
  const reviews = analyticsData?.reviews?.recentReviews || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
        <CardDescription>
          Recent feedback from your customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Complete some orders to start receiving customer feedback.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
                

              ))}
            </div>
            
            {/* {reviews.length > 0 && (
              <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                <Button variant="outline" className="hover:bg-gray-50">
                  View All Reviews
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )} */}

          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsTab;
