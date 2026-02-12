import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import CommissionBoostPanel from './CommissionBoostPanel';
import VendorPerformanceCard from './VendorPerformanceCard';

const VendorBoostDashboard: React.FC = () => {
  const { user } = useAuth();
  const [vendorData, setVendorData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) return;

      try {
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (vendorError) {
          console.error('Error fetching vendor data:', vendorError);
          return;
        }

        setVendorData(vendor);

        // Fetch real performance metrics
        const [servicesResponse, ordersResponse, disputesResponse] = await Promise.all([
          supabase
            .from('services')
            .select('rating, reviews')
            .eq('vendor_id', vendor.id),
          supabase
            .from('orders')
            .select('id, status')
            .eq('vendor_id', vendor.id),
          supabase
            .from('disputes')
            .select('id')
            .in('order_id', (await supabase
              .from('orders')
              .select('id')
              .eq('vendor_id', vendor.id)
            ).data?.map(o => o.id) || [])
        ]);

        // Calculate real metrics
        const services = servicesResponse.data || [];
        const orders = ordersResponse.data || [];
        const disputes = disputesResponse.data || [];

        const totalReviews = services.reduce((sum, service) => sum + (parseInt(service.reviews) || 0), 0);
        const averageRating = services.length > 0 
          ? services.reduce((sum, service) => sum + (parseFloat(service.rating) || 0), 0) / services.length 
          : 0;
        const disputeRate = orders.length > 0 ? (disputes.length / orders.length) * 100 : 0;

        setPerformanceData({
          averageRating,
          totalReviews,
          disputeRate
        });

      } catch (error) {
        console.error('Error fetching vendor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">Vendor data not found. Please complete your vendor profile.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <VendorPerformanceCard
        performanceScore={vendorData.performance_score || 0}
        orderAcceptanceStats={vendorData.order_acceptance_stats || {
          total_requests: 0,
          accepted: 0,
          declined: 0,
          response_time_avg: 0
        }}
        disputeRate={performanceData?.disputeRate || 0}
        averageRating={performanceData?.averageRating || 0}
        totalReviews={performanceData?.totalReviews || 0}
      />

      {/* Commission Boost Panel */}
      <CommissionBoostPanel
        vendorId={vendorData.id}
        currentCommissionRate={vendorData.commission_rate || 10}
        currentBoostRate={vendorData.boost_commission_rate || 0}
      />
    </div>
  );
};

export default VendorBoostDashboard;