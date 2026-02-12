
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import ServiceManagement from '@/components/vendor/services/ServiceManagement';
import VendorActionButtons from '@/components/vendor/action-buttons/VendorActionButtons';

function VendorServicesPage() {
  return (
    <VendorDashboard activeTab="services">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Services</h1>
        <VendorActionButtons />
      </div>
      
      <ServiceManagement />
    </VendorDashboard>
  );
};

export default VendorServicesPage;
