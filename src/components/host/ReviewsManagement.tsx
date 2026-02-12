import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Filter, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrders } from '@/hooks/use-orders';

const ReviewsManagement = () => {
  const { orders } = useOrders();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Get orders that have reviews or need reviews
  const ordersWithReviews = orders.filter(order => order.review);
  const ordersNeedingReviews = orders.filter(order => order.status === 'ended' && !order.review);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const averageRating = ordersWithReviews.length > 0 
    ? ordersWithReviews.reduce((sum, order) => sum + (order.review?.rating || 0), 0) / ordersWithReviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: ordersWithReviews.filter(order => order.review?.rating === rating).length,
    percentage: ordersWithReviews.length > 0 
      ? (ordersWithReviews.filter(order => order.review?.rating === rating).length / ordersWithReviews.length) * 100 
      : 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reviews & Feedback</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter Reviews
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Reviews
          </Button>
        </div>
      </div>

      {/* Reviews Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ordersWithReviews.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{ordersNeedingReviews.length}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting Reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {ordersWithReviews.filter(order => (order.review?.rating || 0) >= 4).length}
            </div>
            <p className="text-sm text-gray-500 mt-1">4+ Star Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 min-w-[80px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[40px]">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Awaiting Reviews</TabsTrigger>
          <TabsTrigger value="recent">Recent Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersWithReviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Vendor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersWithReviews.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.title}</TableCell>
                        <TableCell>{formatDate(order.date || '')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {renderStars(order.review?.rating || 0)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {order.review?.comment || 'No comment'}
                        </TableCell>
                        <TableCell>{order.vendor_name || 'Unknown'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No reviews yet</p>
                  <p className="text-sm">Reviews will appear here after events are completed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders Awaiting Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersNeedingReviews.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersNeedingReviews.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.title}</TableCell>
                        <TableCell>{formatDate(order.date || '')}</TableCell>
                        <TableCell>{order.vendor_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Leave Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending reviews</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersWithReviews.filter(order => {
                const reviewDate = new Date(order.review?.dateSubmitted || order.date || '');
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return reviewDate >= thirtyDaysAgo;
              }).length > 0 ? (
                <div className="space-y-4">
                  {ordersWithReviews
                    .filter(order => {
                      const reviewDate = new Date(order.review?.dateSubmitted || order.date || '');
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return reviewDate >= thirtyDaysAgo;
                    })
                    .map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{order.title}</h4>
                          <div className="flex items-center gap-1">
                            {renderStars(order.review?.rating || 0)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{order.vendor_name}</p>
                        {order.review?.comment && (
                          <p className="text-sm">{order.review.comment}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(order.review?.dateSubmitted || order.date || '')}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent reviews</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewsManagement;