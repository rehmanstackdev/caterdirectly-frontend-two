import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface PerformanceData {
  month: string;
  orders: number;
  completed: number;
  rating: number;
}

interface CustomerDemographics {
  category: string;
  value: number;
}

export const useVendorPerformance = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerDemographics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
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

        // Get ONLY paid orders for the last 12 months (vendors only see confirmed revenue)
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .eq('payment_status', 'paid')
          .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

        // Get reviews for rating calculation
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating, created_at')
          .in('order_id', orders?.map(o => o.id) || []);

        // Process data by month
        const monthlyData: { [key: string]: { orders: number; completed: number; ratings: number[] } } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = months[date.getMonth()];
          monthlyData[monthKey] = { orders: 0, completed: 0, ratings: [] };
        }

        // Process orders
        orders?.forEach(order => {
          const orderDate = new Date(order.created_at);
          const monthKey = months[orderDate.getMonth()];
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].orders++;
            if (order.status === 'completed') {
              monthlyData[monthKey].completed++;
            }
          }
        });

        // Process reviews
        reviews?.forEach(review => {
          const reviewDate = new Date(review.created_at);
          const monthKey = months[reviewDate.getMonth()];
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].ratings.push(review.rating);
          }
        });

        // Convert to array format
        const processedData = Object.entries(monthlyData).map(([month, data]) => ({
          month,
          orders: data.orders,
          completed: data.completed,
          rating: data.ratings.length > 0 
            ? Math.round((data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length) * 10) / 10
            : 0
        }));

        setPerformanceData(processedData);

        // Process customer demographics based on order titles/types
        const demographics: { [key: string]: number } = {
          'Corporate': 0,
          'Private Parties': 0,
          'Weddings': 0,
          'Other Events': 0
        };

        orders?.forEach(order => {
          const title = order.title?.toLowerCase() || '';
          if (title.includes('corporate') || title.includes('business') || title.includes('meeting')) {
            demographics['Corporate']++;
          } else if (title.includes('wedding') || title.includes('bridal')) {
            demographics['Weddings']++;
          } else if (title.includes('party') || title.includes('birthday') || title.includes('celebration')) {
            demographics['Private Parties']++;
          } else {
            demographics['Other Events']++;
          }
        });

        const total = Object.values(demographics).reduce((sum, val) => sum + val, 0);
        if (total > 0) {
          const customerDataArray = Object.entries(demographics).map(([category, count]) => ({
            category,
            value: Math.round((count / total) * 100)
          }));
          setCustomerData(customerDataArray);
        }

      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user]);

  return {
    performanceData,
    customerData,
    loading
  };
};