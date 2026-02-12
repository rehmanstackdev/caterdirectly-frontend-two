
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceItem, ServiceStatus } from '@/types/service-types';
import ServiceDetailsLoader from '@/components/shared/ServiceDetailsLoader';
import CateringServiceDetailsView from '@/components/admin/services/CateringServiceDetailsView';
import VenueServiceDetailsView from '@/components/admin/services/VenueServiceDetailsView';
import PartyRentalServiceDetailsView from '@/components/admin/services/PartyRentalServiceDetailsView';
import EventStaffServiceDetailsView from '@/components/admin/services/EventStaffServiceDetailsView';
import ServiceDetailsHeader from '@/components/admin/services/ServiceDetailsHeader';
import DeleteServiceDialog from '@/components/admin/services/DeleteServiceDialog';
import { useServices } from '@/hooks/services/use-services';
import ServicesService from '@/services/api/services.Service';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAdminPermissions } from '@/hooks/use-admin-permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Dashboard from '@/components/dashboard/Dashboard';

function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>(); // Fixed parameter name
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { deleteService, approveService, rejectService, refreshServices } = useServices();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasPermission } = useAdminPermissions();
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [vendors, setVendors] = useState<{ id: string; company_name: string }[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');

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
            type: backendService.serviceType,
            serviceType: backendService.serviceType,
            status: backendService.status === 'approved' ? 'approved' :
                   backendService.status === 'rejected' ? 'rejected' :
                   backendService.status === 'drafted' ? 'draft' : 'pending_approval',
            active: backendService.status === 'approved' && backendService.visibleStatus === 'active',
            vendorName: backendService.vendor?.businessName || 
                       (backendService.createdBy ? `${backendService.createdBy.firstName || ''} ${backendService.createdBy.lastName || ''}`.trim() : 'Unknown Vendor'),
            vendor_id: backendService.vendor?.id || backendService.vendorId,
            price: backendService.catering?.minimumOrderAmount ? `$${backendService.catering.minimumOrderAmount}` :
                   backendService.venue?.price ? `$${backendService.venue.price}` :
                   backendService.partyRental?.price ? `$${backendService.partyRental.price}` :
                   backendService.eventStaff?.price ? `$${backendService.eventStaff.price}` : 'Contact for pricing',
            image: backendService.catering?.menuPhoto || backendService.venue?.serviceImage || 
                   backendService.partyRental?.serviceImage || backendService.eventStaff?.serviceImage || '',
            description: backendService.description || '',
            isManaged: backendService.manage || 
                       backendService.catering?.manage || 
                       backendService.venue?.manage || 
                       backendService.partyRental?.manage || 
                       backendService.eventStaff?.manage || false,
            // Add direct references for easier access
            serviceName: backendService.serviceName,
            partyRental: backendService.partyRental,
            eventStaff: backendService.eventStaff,
            service_details: {
              ...backendService.catering,
              ...backendService.venue,
              ...backendService.partyRental,
              ...backendService.eventStaff,
              // Preserve nested structure for catering details
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
          
          setService(transformedService);
        } catch (error) {
          console.error("Failed to load service:", error);
          setService(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadService();
  }, [id]);
  
  const handleDelete = async () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!service) return;
    
    const success = await deleteService(service.id);
    if (success) {
      toast({
        title: "Service Deleted",
        description: "The service has been successfully deleted."
      });
      navigate('/admin/services');
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = () => {
    if (id) {
      navigate(`/admin/services/edit/${id}`);
    }
  };

  const handleBack = () => {
    navigate('/admin/services');
  };

  const handleApprove = async () => {
    if (!service) return;
    setIsSubmitting(true);
    try {
      await approveService(service.id);
      toast({ title: 'Service approved', description: `${service.name} is now live.` });
      navigate('/admin/services');
    } catch (error) {
      toast({ title: 'Error approving service', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!service) return;
    if (!feedback.trim()) {
      toast({ title: 'Feedback required', description: 'Please provide rejection feedback.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await rejectService(service.id, feedback);
      toast({ title: 'Service rejected', description: `${service.name} has been rejected.` });
      setIsRejectDialogOpen(false);
      navigate('/admin/services');
    } catch (error) {
      toast({ title: 'Error rejecting service', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const openReassignDialog = async () => {
    if (!hasPermission('services', 'manage')) return;
    setIsReassignDialogOpen(true);
    setVendorsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name')
        .order('company_name');
      if (error) throw error;
      setVendors(data || []);
      setSelectedVendorId(service?.vendor_id || '');
    } catch (e) {
      toast({ title: 'Error loading vendors', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleReassignVendor = async () => {
    if (!service || !selectedVendorId) {
      toast({ title: 'Select a vendor', description: 'Please choose a vendor to assign.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const selected = vendors.find(v => v.id === selectedVendorId);
      const { error } = await supabase
        .from('services')
        .update({ vendor_id: selectedVendorId, vendor_name: selected?.company_name || null })
        .eq('id', service.id);
      if (error) throw error;
      setService(prev => prev ? { ...prev, vendor_id: selectedVendorId, vendorName: selected?.company_name || prev.vendorName } : prev);
      toast({ title: 'Vendor reassigned', description: `Now assigned to ${selected?.company_name || 'selected vendor'}.` });
      setIsReassignDialogOpen(false);
      await refreshServices();
    } catch (e) {
      toast({ title: 'Error reassigning vendor', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDetailsComponent = () => {
    if (loading) return <ServiceDetailsLoader loading={loading} serviceExists={!!service} />;
    
    if (!service) return <div>Service not found</div>;
    
    // Show appropriate details based on service type
    switch (service.type) {
      case 'catering':
        return <CateringServiceDetailsView service={service} />;
      case 'venues':
        return <VenueServiceDetailsView service={service} />;
      case 'party_rentals':
      case 'party_rental':
        return <PartyRentalServiceDetailsView service={service} />;
      case 'events_staff':
      case 'event_staff':
        return <EventStaffServiceDetailsView service={service} />;
      default:
        return <div className="p-4">No specific details available for this service type: {service.type}</div>;
    }
  };
  
  return (
    <Dashboard activeTab="services" userRole="admin">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            {service && (
              <div className="mb-6">
                <ServiceDetailsHeader
                  service={service}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onBack={handleBack}
                />
              </div>
            )}
            {service?.status === 'pending_approval' && (
              <div className="flex items-center gap-3 mb-6">
                <Button onClick={handleApprove} disabled={isSubmitting}>Approve</Button>
                <Button variant="destructive" onClick={() => setIsRejectDialogOpen(true)} disabled={isSubmitting}>Reject</Button>
              </div>
            )}
            {hasPermission('services', 'manage') && (
              <div className="mb-6">
                <Button variant="outline" onClick={openReassignDialog}>Reassign Vendor</Button>
              </div>
            )}
            {renderDetailsComponent()}
          </CardContent>
        </Card>

        <DeleteServiceDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={confirmDelete}
        />

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Service</DialogTitle>
              <DialogDescription>Please provide feedback to help the vendor improve their service.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="feedback">Rejection Feedback</Label>
              <Textarea id="feedback" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button variant="destructive" onClick={handleRejectSubmit} disabled={isSubmitting}>Submit Rejection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isReassignDialogOpen} onOpenChange={setIsReassignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reassign Vendor</DialogTitle>
              <DialogDescription>Select a new vendor for this service.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder={vendorsLoading ? 'Loading vendors...' : 'Select vendor'} />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.company_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReassignDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button onClick={handleReassignVendor} disabled={isSubmitting || !selectedVendorId}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Dashboard>
  );
}

export default ServiceDetailsPage;
