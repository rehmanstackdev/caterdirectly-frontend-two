import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export interface Badge {
  id: string;
  name: string;
  iconName: 'award' | 'flag' | 'star';
  description: string;
  progress: number;
  achieved: boolean;
}

export const useVendorBadges = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get vendor data
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!vendorData) return;

        // Get vendor's orders and reviews
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendorData.id);

        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .in('order_id', orders?.map(o => o.id) || []);

        // Calculate metrics for badges
        const completedOrders = orders?.filter(o => o.status === 'completed') || [];
        const totalOrders = orders?.length || 0;
        const fiveStarReviews = reviews?.filter(r => r.rating === 5) || [];
        const avgRating = reviews?.length ? 
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        const fulfillmentRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

        // Define badges with real progress
        const badgeData: Badge[] = [
          {
            id: '1',
            name: 'Premier Provider',
            iconName: 'award',
            description: 'Maintain a 4.8+ rating with 95% completion rate',
            progress: Math.min(
              ((avgRating >= 4.8 ? 50 : (avgRating / 4.8) * 50) + 
               (fulfillmentRate >= 95 ? 50 : (fulfillmentRate / 95) * 50)), 
              100
            ),
            achieved: avgRating >= 4.8 && fulfillmentRate >= 95
          },
          {
            id: '2',
            name: 'Reliability Champion',
            iconName: 'flag',
            description: 'Complete 50+ bookings with 100% fulfillment rate',
            progress: Math.min(
              ((completedOrders.length >= 50 ? 70 : (completedOrders.length / 50) * 70) + 
               (fulfillmentRate >= 100 ? 30 : (fulfillmentRate / 100) * 30)), 
              100
            ),
            achieved: completedOrders.length >= 50 && fulfillmentRate >= 100
          },
          {
            id: '3',
            name: 'Client Favorite',
            iconName: 'star',
            description: 'Receive 25+ five-star reviews',
            progress: Math.min((fiveStarReviews.length / 25) * 100, 100),
            achieved: fiveStarReviews.length >= 25
          }
        ];

        setBadges(badgeData);

      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  return {
    badges,
    loading
  };
};