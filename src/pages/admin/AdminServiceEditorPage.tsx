
import { useParams } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { AdminServiceEditor } from '@/components/admin/services/AdminServiceEditor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function AdminServiceEditorPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Dashboard userRole="admin" activeTab="services">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-gray-500 mb-4">Invalid service ID</p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="admin" activeTab="services">
      <AdminServiceEditor serviceId={id} />
    </Dashboard>
  );
}

export default AdminServiceEditorPage;
