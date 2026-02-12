import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import VendorClientManager from '@/components/vendor/clients/VendorClientManager';
import VendorActionButtons from '@/components/vendor/action-buttons/VendorActionButtons';

function VendorClientManagementPage() {
  return (
    <VendorDashboard activeTab="clients">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <VendorActionButtons />
      </div>
      
      <VendorClientManager />
    </VendorDashboard>
  );
};

export default VendorClientManagementPage;