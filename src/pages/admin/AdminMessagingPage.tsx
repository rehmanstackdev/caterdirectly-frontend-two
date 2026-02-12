import Dashboard from '@/components/dashboard/Dashboard';
import AdminMessagingHub from '@/components/admin/messaging/AdminMessagingHub';

function AdminMessagingPage() {
  return (
    <Dashboard activeTab="messaging" userRole="admin">
      <div className="h-full">
        <AdminMessagingHub />
      </div>
    </Dashboard>
  );
}

export default AdminMessagingPage;