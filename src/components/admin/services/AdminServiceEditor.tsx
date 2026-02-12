

import { useParams } from 'react-router-dom';
import ServiceFormContainer from '@/components/vendor/services/form/ServiceFormContainer';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

interface AdminServiceEditorProps {
  serviceId: string;
}

export const AdminServiceEditor = ({ serviceId }: AdminServiceEditorProps) => {
  const { hasPermission, loading } = useAdminPermissions();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  if (!hasPermission('services', 'manage')) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to edit services.',
      variant: 'destructive'
    });
    
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have permission to edit services.</p>
        </div>
      </Card>
    );
  }

  // Use the same ServiceFormContainer as vendors but with admin context
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Admin Service Editor</h2>
        <p className="text-blue-700 text-sm">
          You are editing this service as an administrator. All changes will be applied to the vendor's service.
        </p>
      </div>
      
      <ServiceFormContainer 
        serviceId={serviceId} 
        mode="edit"
        adminContext={true}
      />
    </div>
  );
};
