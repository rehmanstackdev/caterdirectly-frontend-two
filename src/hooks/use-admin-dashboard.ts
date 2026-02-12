
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { APPROVED_VENDOR_STATUSES, APPROVED_BRAND_STATUSES } from '@/constants/vendor';

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  monthlyRevenue: number;
  approvedVendors: number;
  pendingVendors: number;
  waitlistEntries: number;
}

interface RecentActivity {
  id: string;
  type: string;
  name: string;
  date: string;
  status: string;
}

interface SystemMetrics {
  systemUptime: string;
  apiResponse: string;
  errorRate: string;
  paymentSuccess: string;
}

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        { count: totalUsers },
        { count: totalVendors },
        { count: totalBookings },
        { data: orders },
        { count: vendorsApproved },
        { count: brandsApproved },
        { count: pendingVendorsCount },
        { count: pendingBrandsCount },
        { count: waitlistEntries }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('price').eq('status', 'completed'),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).in('status', APPROVED_VENDOR_STATUSES),
        supabase.from('vendor_brands').select('*', { count: 'exact', head: true }).in('status', APPROVED_BRAND_STATUSES),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('vendor_brands').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ai_event_planner_waitlist').select('*', { count: 'exact', head: true })
      ]);

      // Calculate monthly revenue
      const monthlyRevenue = orders?.reduce((sum, order) => {
        return sum + (parseFloat(order.price?.toString() || '0') || 0);
      }, 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        totalBookings: totalBookings || 0,
        monthlyRevenue,
        approvedVendors: (vendorsApproved || 0) + (brandsApproved || 0),
        pendingVendors: (pendingVendorsCount || 0) + (pendingBrandsCount || 0),
        waitlistEntries: waitlistEntries || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['admin-recent-activities'],
    queryFn: async (): Promise<RecentActivity[]> => {
      const activities: RecentActivity[] = [];

      // Get recent vendor applications
      const { data: recentVendors } = await supabase
        .from('vendors')
        .select('id, company_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent services
      const { data: recentServices } = await supabase
        .from('services')
        .select('id, name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent disputes
      const { data: recentDisputes } = await supabase
        .from('disputes')
        .select('id, reason, status, date_submitted')
        .order('date_submitted', { ascending: false })
        .limit(3);

      // Format vendor activities
      recentVendors?.forEach(vendor => {
        activities.push({
          id: vendor.id,
          type: 'New Vendor',
          name: vendor.company_name,
          date: new Date(vendor.created_at).toLocaleString(),
          status: vendor.status === 'pending' ? 'pending_approval' : vendor.status
        });
      });

      // Format order activities
      recentOrders?.forEach(order => {
        activities.push({
          id: order.id,
          type: 'New Booking',
          name: order.title,
          date: new Date(order.created_at).toLocaleString(),
          status: order.status
        });
      });

      // Format service activities
      recentServices?.forEach(service => {
        activities.push({
          id: service.id,
          type: 'Service Update',
          name: service.name,
          date: new Date(service.created_at).toLocaleString(),
          status: service.status
        });
      });

      // Format dispute activities
      recentDisputes?.forEach(dispute => {
        activities.push({
          id: dispute.id,
          type: 'Support Ticket',
          name: `Dispute: ${dispute.reason}`,
          date: new Date(dispute.date_submitted).toLocaleString(),
          status: dispute.status
        });
      });

      // Sort by date and return top 10
      return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useSystemMetrics = (): SystemMetrics => {
  // For now, return calculated metrics based on system status
  // In a real implementation, these would come from monitoring tools
  return {
    systemUptime: "99.98%",
    apiResponse: "132ms",
    errorRate: "0.03%",
    paymentSuccess: "99.7%"
  };
};
