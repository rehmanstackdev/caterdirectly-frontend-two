
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import TeamManagement from '@/components/vendor/team/TeamManagement';

function VendorTeamPage() {
  return (
    <VendorDashboard activeTab="team">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Management</h1>
        </div>
        <TeamManagement />
      </div>
    </VendorDashboard>
  );
};

export default VendorTeamPage;
