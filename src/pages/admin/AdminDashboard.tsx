
import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import AdminMetricsGrid from "@/components/admin/dashboard/AdminMetricsGrid";
import AdminOrderPipeline from "@/components/admin/dashboard/AdminOrderPipeline";
import AdminQuickActions from "@/components/admin/dashboard/AdminQuickActions";
import AdminActivityFeed from "@/components/admin/dashboard/AdminActivityFeed";
import { AdminCalendarWidget } from "@/components/admin/calendar/AdminCalendarWidget"

const AdminDashboard = () => {
  return (
    <Dashboard activeTab="dashboard" userRole="admin">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>
        
        {/* Metrics Grid - 4 cards in one row */}
        <AdminMetricsGrid />
        
        {/* Full-Width Calendar */}
        <AdminCalendarWidget />
        
        {/* Order Pipeline and Quick Actions */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <AdminOrderPipeline />
          <AdminQuickActions />
        </div>
        
        {/* Activity Feed */}
        <AdminActivityFeed />
      </div>
    </Dashboard>
  );
};

export default AdminDashboard;
