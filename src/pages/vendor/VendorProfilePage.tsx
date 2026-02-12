
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import VendorAccountSettings from '@/components/vendor/settings/VendorAccountSettings';

function VendorProfilePage() {
  return (
    <VendorDashboard activeTab="settings">
      <VendorAccountSettings />
    </VendorDashboard>
  );
};

export default VendorProfilePage;
