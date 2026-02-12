import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import VendorSupportCenter from '@/components/vendor/support/VendorSupportCenter';
import VendorActionButtons from '@/components/vendor/action-buttons/VendorActionButtons';

function VendorSupportPage() {
  return (
    <VendorDashboard activeTab="support">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Center</h1>
        <VendorActionButtons />
      </div>
      
      <VendorSupportCenter />
    </VendorDashboard>
  );
};

export default VendorSupportPage;