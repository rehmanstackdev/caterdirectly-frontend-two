
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { AdminProposalForm } from '@/components/admin/proposals/AdminProposalForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getService } from '@/hooks/services/service-operations';
import { ServiceItem } from '@/types/service-types';

function AdminInvoicePage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const serviceIdFromParams = serviceId || searchParams.get('serviceId');
  
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadService = async () => {
      if (!serviceIdFromParams) {
        // No specific service selected; proceed with generic proposal creation
        setLoading(false);
        return;
      }

      try {
        const serviceData = await getService(serviceIdFromParams);
        setService(serviceData);
      } catch (error) {
        console.error('Failed to load service:', error);
        setError('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceIdFromParams]);

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <Dashboard userRole="admin" activeTab="services">
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
          <span className="ml-3">Loading service...</span>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard userRole="admin" activeTab="services">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={handleBack}>
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
      <AdminProposalForm service={service} onBack={handleBack} />
    </Dashboard>
  );
}

export default AdminInvoicePage;
