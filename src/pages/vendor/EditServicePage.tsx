
import { useParams } from 'react-router-dom';
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import ServiceFormContainer from '@/components/vendor/services/form/ServiceFormContainer';

function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <VendorDashboard activeTab="services">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Service</h1>
        <p className="text-gray-500">Update your service information</p>
      </div>
      
      <ServiceFormContainer serviceId={id} mode="edit" />
    </VendorDashboard>
  );
};

export default EditServicePage;
