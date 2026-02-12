
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import ServiceFormContainer from '@/components/vendor/services/form/ServiceFormContainer';

function CreateServicePage() {
  return (
    <VendorDashboard activeTab="services">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Service</h1>
        <p className="text-gray-500">Create a new service to offer to your customers</p>
      </div>
      
      <ServiceFormContainer />
    </VendorDashboard>
  );
};

export default CreateServicePage;
