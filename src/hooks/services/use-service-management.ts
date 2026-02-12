
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useServices } from '@/hooks/services/use-services';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { ServiceItem } from '@/types/service-types';

import { getDisplayPrice } from '@/utils/service-utils';

const ITEMS_PER_PAGE = 10;

export function useServiceManagement() {
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Always use vendorId as the parameter name for consistency
  const vendorIdFromUrl = queryParams.get('vendorId') || queryParams.get('vendor');
  
  // For vendor context, get vendor ID from localStorage user_data if not in URL
  const getVendorIdFromStorage = () => {
    if (userRole === 'vendor') {
      try {
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          return userData.vendor?.id || userData.vendorId;
        }
      } catch (error) {
        console.error('Error parsing user data for vendor ID:', error);
      }
    }
    return undefined;
  };
  
  const vendorId = vendorIdFromUrl || getVendorIdFromStorage();
  
  // Debug logging
  console.log('Service Management - Vendor ID Context:', {
    vendorIdFromUrl,
    vendorIdFromStorage: getVendorIdFromStorage(),
    finalVendorId: vendorId,
    userRole
  });
  
  // Map tab to backend status filter
  const getStatusFilterForTab = (tab: string): string | undefined => {
    switch (tab) {
      case 'active':
        return 'active'; // Uses visibleStatus filter
      case 'inactive':
        return 'inactive'; // Uses visibleStatus filter
      case 'drafts':
        return 'drafts'; // Will be mapped to 'drafted' in useServices
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      default:
        return undefined;
    }
  };

  const {
    services,
    loading,
    pagination,
    updateService,
    deleteService,
    submitServiceForApproval,
    refreshServices
  } = useServices(vendorId, getStatusFilterForTab(activeTab), {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    enablePagination: true
  });

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);
  
  // Add vendor name state to display when filtering by vendor
  const [vendorName, setVendorName] = useState<string | null>(null);
  
  // Get vendor name when filtering by vendor ID
  useEffect(() => {
    const fetchVendorName = async () => {
      if (vendorIdFromUrl) {
        try {
          console.log("Setting vendor name for ID:", vendorIdFromUrl);
          // For now, just use a placeholder since we don't have vendor name lookup
          setVendorName(`Vendor (${vendorIdFromUrl.slice(0, 8)}...)`);
        } catch (error) {
          console.error("Error in fetchVendorName:", error);
          setVendorName(`Unknown Vendor (${vendorIdFromUrl.slice(0, 8)}...)`);
        }
      } else {
        setVendorName(null);
      }
    };
    
    fetchVendorName();
  }, [vendorIdFromUrl]);
  
  const getFilteredServices = useCallback(() => {
    // Services are already filtered by API (status or visibleStatus)
    // No additional client-side filtering needed as API handles it
    return services;
  }, [services]);
  
  const toggleServiceStatus = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    try {
      await updateService(id, { active: !service.active });
      toast.success(`Service ${service.active ? 'deactivated' : 'activated'} successfully`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update service status');
    }
  };
  
  // Update to use context-aware navigation
  const handleEdit = (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    // Check if we're in an admin context
    const isAdminContext = location.pathname.includes('admin');
    
    if (isAdminContext) {
      navigate(`/admin/services/edit/${id}`);
    } else {
      navigate(`/vendor/services/edit/${id}`);
    }
  };
  
  // Update to use context-aware navigation for view
  const handleView = (id: string) => {
    // Check if we're in an admin context
    const isAdminContext = location.pathname.includes('admin');
    
    if (isAdminContext) {
      navigate(`/admin/services/${id}`);
    } else {
      navigate(`/vendor/services/${id}`);
    }
  };
  
  const handleDelete = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        const success = await deleteService(id);
        if (success) {
          toast.success('Service deleted successfully');
        }
      } catch (error: any) {
        if (error?.response?.status === 403) {
          toast.error('Access denied. You do not have permission to delete this service.');
        } else {
          toast.error(error?.response?.data?.message || 'Failed to delete service');
        }
      }
    }
  };
  
  const handleCreateService = () => {
    // Check if we're in an admin context
    const isAdminContext = location.pathname.includes('admin');
    
    // Always use vendorId parameter name for consistency
    if (vendorIdFromUrl) {
      navigate(`${isAdminContext ? '/admin' : '/vendor'}/create-vendor-service?vendorId=${vendorIdFromUrl}`);
    } else {
      navigate(`${isAdminContext ? '/admin/create-vendor-service' : '/vendor/create-service'}`);
    }
  };
  
  const handleSubmitForApproval = async (id: string) => {
    const service = services.find(s => s.id === id);
    if (!service) return;
    
    try {
      // First, ensure the pricing is properly updated
      let updatedService = { ...service };
      
      // If it's a catering service with combo pricing in service_details but $0 in top-level price
      if ((service.type === 'catering' || service.serviceType === 'catering') && 
          (!service.price || service.price === '0' || service.price === '$0')) {
        
        const displayPrice = getDisplayPrice(service);
        if (displayPrice && displayPrice !== 'Price varies') {
          // Update the service with the correct display price
          console.log(`Updating service ${service.id} price from ${service.price} to ${displayPrice}`);
          
          // First update the local service for submission
          updatedService.price = displayPrice;
          
          // Also update in the database
          await updateService(id, { price: displayPrice });
        }
      }
      
      // Then submit for approval
      await submitServiceForApproval.submitService(id, updatedService);
      
      toast.success('Service submitted for approval successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit service for approval');
    }
  };
  
  // Update clearVendorFilter to navigate to the correct path based on user role
  const clearVendorFilter = () => {
    // Check if we're in the admin context by looking at the current path
    const isAdminContext = location.pathname.includes('admin');
    
    if (isAdminContext) {
      navigate('/admin/services');
    } else {
      navigate('/vendor/services');
    }
  };
  
  const filteredServices = useMemo(() => getFilteredServices(), [getFilteredServices]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    activeTab,
    setActiveTab,
    loading,
    filteredServices,
    toggleServiceStatus,
    handleEdit,
    handleView,
    handleDelete,
    handleCreateService,
    handleSubmitForApproval,
    refreshServices,
    vendorIdFromUrl,
    vendorName,
    clearVendorFilter,
    // Pagination
    currentPage,
    totalPages: pagination?.totalPages || 1,
    totalItems: pagination?.totalItems || services.length,
    itemsPerPage: ITEMS_PER_PAGE,
    handlePageChange
  };
}
