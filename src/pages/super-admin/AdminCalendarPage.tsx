
import Dashboard from "@/components/dashboard/Dashboard";
import AvailabilityManager from '@/components/vendor/calendar/AvailabilityManager';
import { useAuth } from "@/contexts/auth";
import { useSearchParams } from "react-router-dom";

function AdminCalendarPage() {
  const { userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get("vendorId") || undefined;

  const getActiveTab = () => "vendors";

  const dashboardUserRole =
    userRole === "admin" || userRole === "super-admin" ? "admin" : "event-host";

  return (
    <Dashboard userRole={'super-admin'} activeTab={'vendors'}>
      <div className="space-y-6">
        <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center">
          <h1 className="text-2xl font-bold">Calendar & Availability</h1>
          <p className="text-gray-600">Manage your business hours and blocked dates</p>
        </div>
        <AvailabilityManager vendorId={vendorId} />
      </div>
    </Dashboard>
  );
};

export default AdminCalendarPage;
