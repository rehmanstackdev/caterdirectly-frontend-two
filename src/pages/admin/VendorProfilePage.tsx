
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { VendorProfileView } from '@/components/admin/vendors/VendorProfileView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function VendorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <Dashboard userRole="admin" activeTab="vendors">
        <div className="text-center py-10">
          <p className="text-gray-500">Invalid vendor ID</p>
          <Button onClick={() => navigate('/admin/vendors')} className="mt-4">
            Back to Vendors
          </Button>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="vendors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/vendors')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Vendors</span>
            </Button>
            <h1 className="text-2xl font-bold">Vendor Profile</h1>
          </div>
        </div>

        <VendorProfileView vendorId={id} />
      </div>
    </Dashboard>
  );
}

export default VendorProfilePage;
