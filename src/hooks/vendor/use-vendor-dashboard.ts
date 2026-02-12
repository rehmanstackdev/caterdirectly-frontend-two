import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import ServicesService from '@/services/api/services.Service';
import { useVendorData } from './use-vendor-data';

interface VendorMetrics {
  monthlyRevenue: number;
  totalBookings: number;
  avgRating: number;
  upcomingEvents: number;
  totalServices: number;
  activeServices: number;
  pendingServices: number;
}

export function useVendorDashboard() {
  const [metrics, setMetrics] = useState<VendorMetrics>({
    monthlyRevenue: 0,
    totalBookings: 0,
    avgRating: 0,
    upcomingEvents: 0,
    totalServices: 0,
    activeServices: 0,
    pendingServices: 0
  });
  const [loading, setLoading] = useState(true);
  const { vendorData } = useVendorData();

  useEffect(() => {
    const fetchVendorMetrics = async () => {
      if (!vendorData?.id) return;
      
      try {
        setLoading(true);
        // Use the dedicated service stats API
        const stats = await ServicesService.getStateOfVendors();
        
        // Map API response to metrics (matching actual API response structure)
        setMetrics({
          monthlyRevenue: 0,
          totalBookings: 0,
          avgRating: stats.rating || 0,
          upcomingEvents: 0,
          totalServices: stats.totalServiceCount || 0,
          activeServices: stats.activeServiceCount || 0,
          pendingServices: stats.pendingServiceCount || 0
        });
      } catch (error) {
        console.error('Error fetching vendor metrics:', error);
        // Set default values on error
        setMetrics({
          monthlyRevenue: 0,
          totalBookings: 0,
          avgRating: 0,
          upcomingEvents: 0,
          totalServices: 0,
          activeServices: 0,
          pendingServices: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorMetrics();
  }, [vendorData?.id]);

  return { metrics, loading };
}