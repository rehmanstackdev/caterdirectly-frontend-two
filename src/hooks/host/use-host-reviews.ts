import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useOrders } from '@/hooks/use-orders';

export interface SubmittedReview {
  id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export const useHostReviews = () => {
  const { user } = useAuth();
  const { allOrders } = useOrders();
  const [submitted, setSubmitted] = useState<SubmittedReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Orders that are completed and still need a review (host-centric)
  const needsReviewOrders = useMemo(() => {
    return (allOrders || []).filter(o => o.status === 'ended' && (o.needs_review === true || !o.review));
  }, [allOrders]);

  useEffect(() => {
    const fetchSubmitted = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const endedOrderIds = (allOrders || [])
          .filter(o => o.status === 'ended')
          .map(o => o.id);
        if (endedOrderIds.length === 0) {
          setSubmitted([]);
          return;
        }
        const { data, error } = await supabase
          .from('reviews')
          .select('id, order_id, rating, comment, created_at, user_id')
          .eq('user_id', user.id)
          .in('order_id', endedOrderIds)
          .order('created_at', { ascending: false })
          .limit(50);
        if (error) throw error;
        setSubmitted(
          (data || []).map(r => ({
            id: r.id as string,
            order_id: r.order_id as string,
            rating: r.rating as number,
            comment: (r as any).comment ?? null,
            created_at: r.created_at as string,
          }))
        );
      } catch (e) {
        console.error('useHostReviews error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmitted();
  }, [user, allOrders]);

  return { needsReviewOrders, submitted, loading, allOrders };
};
