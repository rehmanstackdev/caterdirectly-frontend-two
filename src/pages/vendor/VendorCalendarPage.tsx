
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import AvailabilityManager from '@/components/vendor/calendar/AvailabilityManager';

function VendorCalendarPage() {
  return (
    <VendorDashboard activeTab="calendar">
      <div className="space-y-6">
        <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center">
          <h1 className="text-2xl font-bold">Calendar & Availability</h1>
          <p className="text-gray-600">Manage your business hours and blocked dates</p>
        </div>
        <AvailabilityManager />
      </div>
    </VendorDashboard>
  );
};

export default VendorCalendarPage;
