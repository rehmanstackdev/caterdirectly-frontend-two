
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { ServiceItem } from '@/types/service-types';
import { useServices } from '@/hooks/services/use-services';
import ServicesService from '@/services/api/services.Service';
import { toast } from 'sonner';

// Import the refactored components
import ServiceDetailHeader from '@/components/vendor/services/detail/ServiceDetailHeader';
import ServiceBasicInfo from '@/components/vendor/services/detail/ServiceBasicInfo';
import ServiceDetailsLoader from '@/components/vendor/services/detail/ServiceDetailsLoader';
import CateringServiceDetailsView from '@/components/vendor/services/detail/CateringServiceDetailsView';
import VenueServiceDetailsView from '@/components/vendor/services/detail/VenueServiceDetailsView';
import PartyRentalServiceDetailsView from '@/components/vendor/services/detail/PartyRentalServiceDetailsView';
import EventStaffServiceDetailsView from '@/components/vendor/services/detail/EventStaffServiceDetailsView';

function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteService } = useServices();
  const [serviceData, setServiceData] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      if (id) {
        setLoading(true);
        try {
          const backendService = await ServicesService.getServiceById(id);
          
          if (!backendService) {
            throw new Error('Service not found');
          }
          
          // Transform backend service to frontend ServiceItem format
          const transformedService: ServiceItem = {
            id: backendService.id,
            name: backendService.serviceName,
            serviceName: backendService.serviceName,
            type: backendService.serviceType,
            serviceType: backendService.serviceType,
            status: backendService.status === 'approved' ? 'approved' :
                   backendService.status === 'rejected' ? 'rejected' :
                   backendService.status === 'drafted' ? 'draft' : 'pending_approval',
            active: backendService.status === 'approved' && backendService.visibleStatus === 'active',
            vendorName: backendService.vendor?.businessName || 
                       (backendService.createdBy ? `${backendService.createdBy.firstName || ''} ${backendService.createdBy.lastName || ''}`.trim() : 'Unknown Vendor'),
            vendor_id: backendService.vendor?.id || backendService.vendorId,
            price: backendService.catering?.minimumOrderAmount ? `${backendService.catering.minimumOrderAmount}` :
                   backendService.venue?.price ? `${backendService.venue.price}` :
                   backendService.partyRental?.price ? `${backendService.partyRental.price}` :
                   backendService.eventStaff?.price ? `${backendService.eventStaff.price}` : 'Contact for pricing',
            image: backendService.catering?.menuPhoto || backendService.venue?.serviceImage || 
                   backendService.partyRental?.serviceImage || backendService.eventStaff?.serviceImage || '',
            description: backendService.description || '',
            location: backendService.vendor?.fullAddress || 
                     backendService.vendor?.address || 
                     (backendService.vendor?.city && backendService.vendor?.state 
                       ? `${backendService.vendor.city}, ${backendService.vendor.state}`
                       : 'No location specified'),
            isManaged: backendService.manage || 
                       backendService.catering?.manage || 
                       backendService.venue?.manage || 
                       backendService.partyRental?.manage || 
                       backendService.eventStaff?.manage || false,
            // Add direct references for easier access
            partyRental: backendService.partyRental,
            eventStaff: backendService.eventStaff,
            service_details: {
              ...backendService.catering,
              ...backendService.venue,
              ...backendService.partyRental,
              ...backendService.eventStaff,
              // Preserve nested structure
              ...(backendService.catering && { catering: backendService.catering }),
              ...(backendService.venue && { venue: backendService.venue }),
              ...(backendService.partyRental && { partyRental: backendService.partyRental }),
              ...(backendService.eventStaff && { eventStaff: backendService.eventStaff }),
              ...(backendService.createdBy && { createdBy: backendService.createdBy }),
              ...(backendService.vendor && { vendor: backendService.vendor })
            },
            createdAt: backendService.createdAt,
            updatedAt: backendService.updatedAt
          };
          
          setServiceData(transformedService);
        } catch (error) {
          console.error("Failed to load service:", error);
          toast.error('Failed to load service details');
          setServiceData(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadService();
  }, [id]);

  const handleDelete = async () => {
    if (!serviceData) return;
    
    if (window.confirm(`Are you sure you want to delete "${serviceData.name}"?`)) {
      const success = await deleteService(serviceData.id);
      if (success) {
        toast.success('Service deleted successfully');
        navigate('/vendor/services');
      }
    }
  };

  const getStatusBadgeColor = (status: string, active: boolean) => {
    if (status === 'pending_approval') return 'bg-yellow-100 text-yellow-800';
    if (status === 'rejected') return 'bg-red-100 text-red-800';
    if (status === 'draft') return 'bg-purple-100 text-purple-800';
    return active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string, active: boolean) => {
    if (status === 'pending_approval') return 'Pending Approval';
    if (status === 'rejected') return 'Rejected';
    if (status === 'draft') return 'Draft';
    return active ? 'Active' : 'Inactive';
  };

  const renderDetailsComponent = () => {
    if (!serviceData) return null;
    
    // Show appropriate details based on service type
    switch (serviceData.type) {
      case 'catering':
        return serviceData.service_details?.catering ? (
          <CateringServiceDetailsView details={serviceData.service_details.catering} />
        ) : null;
      case 'venues':
        return serviceData.service_details ? (
          <VenueServiceDetailsView details={serviceData.service_details} />
        ) : null;
      case 'party_rentals':
      case 'party_rental':
        return serviceData.service_details?.partyRental || serviceData.partyRental ? (
          <PartyRentalServiceDetailsView details={serviceData.service_details?.partyRental || serviceData.partyRental} />
        ) : null;
      case 'events_staff':
      case 'event_staff':
        return serviceData.service_details?.eventStaff || serviceData.eventStaff ? (
          <EventStaffServiceDetailsView details={serviceData.service_details?.eventStaff || serviceData.eventStaff} />
        ) : null;
      default:
        return <div className="p-4">No specific details available for this service type: {serviceData.type}</div>;
    }
  };

  return (
    <Dashboard activeTab="services" userRole="vendor">
      <div className="space-y-6">
        {/* Header with action buttons */}
        <ServiceDetailHeader 
          handleDelete={handleDelete}
          serviceId={id}
        />

        {/* Loading or not found states */}
        <ServiceDetailsLoader 
          loading={loading} 
          serviceExists={!!serviceData}
        />

        {/* Display service details when available */}
        {serviceData && (
          <>
            {/* Basic service information */}
            <ServiceBasicInfo 
              service={serviceData}
              getStatusLabel={getStatusLabel}
              getStatusBadgeColor={getStatusBadgeColor}
            />

            {/* Service type-specific details */}
            {renderDetailsComponent()}
          </>
        )}
      </div>
    </Dashboard>
  );
};

export default ServiceDetailPage;
