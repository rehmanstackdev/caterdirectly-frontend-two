import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import AdminWaitlistTable from "@/components/admin/waitlist/AdminWaitlistTable";

const AdminWaitlistPage = () => {
  console.log("AdminWaitlistPage: Rendering waitlist management page");

  return (
    <Dashboard activeTab="waitlist" userRole="admin">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 px-1">
            Beta Waitlist Management
          </h1>
          <AdminWaitlistTable />
        </div>
      </div>
    </Dashboard>
  );
};

export default AdminWaitlistPage;