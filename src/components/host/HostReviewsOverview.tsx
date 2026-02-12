import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useHostReviews } from '@/hooks/host/use-host-reviews';
import OrderReviewDialog from '@/components/reviews/OrderReviewDialog';
import { useOrders } from '@/hooks/use-orders';

const HostReviewsOverview = () => {
  const navigate = useNavigate();
  const { needsReviewOrders, submitted, loading, allOrders } = useHostReviews();

  const getOrderTitle = (orderId: string) => allOrders.find(o => o.id === orderId)?.title || 'Order';
  const getVendorName = (orderId: string) => allOrders.find(o => o.id === orderId)?.vendor_name || 'Vendor';
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const { submitServiceReviews, isSubmittingServiceReviews } = useOrders() as any;


  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your Vendor Reviews</h1>
        <Button variant="outline" onClick={() => navigate('/host/orders')}>Go to Orders</Button>
      </header>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Needs Your Review</CardTitle>
            <CardDescription>Complete reviews for recently completed orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 rounded-md animate-pulse bg-muted" />
                ))}
              </div>
            ) : needsReviewOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending reviews right now.</p>
            ) : (
              <div className="space-y-3">
                {needsReviewOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between rounded-md border p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{order.title}</span>
                        <Badge variant="secondary">{order.vendor_name || 'Vendor'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Completed • {new Date(order.date || order.created_at || '').toLocaleDateString()}</p>
                    </div>
                    <Button onClick={() => setReviewOrderId(order.id)}>Leave Review</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Submitted Reviews</CardTitle>
            <CardDescription>Your recent feedback for vendors</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="h-20 rounded-md animate-pulse bg-muted" />
                ))}
              </div>
            ) : submitted.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven’t submitted any reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {submitted.map(rv => (
                  <article key={rv.id} className="rounded-md border p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{getOrderTitle(rv.order_id)}</h3>
                        <p className="text-sm text-muted-foreground truncate">{getVendorName(rv.order_id)} • {new Date(rv.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < rv.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    {rv.comment && <p className="mt-2 text-sm">{rv.comment}</p>}
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
        {reviewOrderId && (
          <OrderReviewDialog
            order={allOrders.find(o => o.id === reviewOrderId) || null}
            open={!!reviewOrderId}
            onClose={() => setReviewOrderId(null)}
            onSubmit={async (reviews) => {
              if (!reviewOrderId) return;
              await submitServiceReviews(reviewOrderId, reviews);
            }}
          />
        )}
    </main>
  );
};

export default HostReviewsOverview;
