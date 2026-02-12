
import { useParams } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import ServiceFormContainer from '@/components/vendor/services/form/ServiceFormContainer';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

function AdminEditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAdminPermissions();
  
  // Check if the admin has permission to edit services
  if (!hasPermission('services', 'manage')) {
    toast({
      title: "Permission Denied",
      description: "You don't have permission to edit services",
      variant: "destructive"
    });
    return (
      <Dashboard userRole="admin" activeTab="services">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-red-600">Permission Denied</h2>
          <p className="mt-2">You don't have sufficient permissions to edit services.</p>
        </Card>
      </Dashboard>
    );
  }
  
  return (
    <Dashboard userRole="admin" activeTab="services">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit Service</h1>
        <p className="text-gray-500">
          Editing service as an administrator. Changes will be applied to the vendor's service.
        </p>
        
        {id ? (
          <ServiceFormContainer 
            serviceId={id} 
            mode="edit"
            adminContext={true}
          />
        ) : (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-red-600">Invalid Service ID</h2>
            <p className="mt-2">No service ID was provided.</p>
          </Card>
        )}
      </div>
    </Dashboard>
  );
}

export default AdminEditServicePage;
