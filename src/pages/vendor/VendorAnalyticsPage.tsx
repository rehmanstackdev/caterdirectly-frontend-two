import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import VendorAnalytics from '@/components/vendor/analytics/VendorAnalytics';

function VendorAnalyticsPage() {
  return (
    <VendorDashboard activeTab="analytics">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
        <VendorAnalytics />
      </div>
    </VendorDashboard>
  );
};

export default VendorAnalyticsPage;