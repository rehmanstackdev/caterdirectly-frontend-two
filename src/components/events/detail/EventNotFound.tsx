
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Dashboard from '@/components/dashboard/Dashboard';

const EventNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Dashboard activeTab="analytics" userRole="event-host">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">Event Not Found</h2>
        <p className="text-gray-500 mt-2">The event you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={() => navigate('/host/analytics')}>
          Back to Events
        </Button>
      </div>
    </Dashboard>
  );
};

export default EventNotFound;
