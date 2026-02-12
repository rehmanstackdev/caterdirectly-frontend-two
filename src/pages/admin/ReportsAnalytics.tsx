
import { BarChart2 } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";

function ReportsAnalytics() {
  return (
    <Dashboard userRole="admin" activeTab="reports">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        
        <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
          <div className="text-center">
            <BarChart2 className="h-16 w-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-xl">Reports & Analytics</h2>
            <p className="mt-2 text-gray-500 max-w-md">
              This module will provide comprehensive reporting tools, business intelligence, user behavior analytics, and trend analysis.
            </p>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

export default ReportsAnalytics;
