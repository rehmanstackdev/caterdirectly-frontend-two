
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { Tabs } from '@/components/ui/tabs';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import MarketplaceLayout from '@/components/marketplace/MarketplaceLayout';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceTabsList from '@/components/marketplace/MarketplaceTabsList';
import InvoiceModeBanner from '@/components/marketplace/InvoiceModeBanner';
import LazyTabLoader from '@/components/marketplace/LazyTabLoader';
import { useMarketplaceTabs } from '@/hooks/use-marketplace-tabs';
import { useInvoice } from '@/contexts/InvoiceContext';
import { usePageMeta } from '@/hooks/use-page-meta';
import { useAuth } from '@/contexts/auth';
import { FilterProvider } from '@/contexts/FilterContext';
import Dashboard from '@/components/dashboard/Dashboard';
import CartBadge from '@/components/marketplace/CartBadge';
import AddGroupOrderModal, { GroupOrderData } from '@/components/admin/AddGroupOrderModal';
import GroupOrderSuccessModal from '@/components/admin/GroupOrderSuccessModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const VendorMarketPlace = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [showGroupOrderModal, setShowGroupOrderModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<GroupOrderData & { inviteToken: string } | null>(null);
  const { setInvoiceMode: setProposalMode, isInvoiceMode: isProposalMode } = useInvoice();
  const { activeTab, setActiveTab } = useMarketplaceTabs();
  const { user, userRole } = useAuth();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  // Extract booking mode and existing services from location state
  const locationState = location.state as any;
  const isBookingMode = Boolean(locationState?.bookingMode || locationState?.addingToExistingBooking || locationState?.addingAdditionalService);
  const existingServices = locationState?.currentBookingServices || locationState?.currentServices || [];
  
  // Check if we're in vendor mode based on URL params
  const isVendorMode = searchParams.get('vendor') === 'true';

  
  // Check if we're in proposal mode - optimized
  useEffect(() => {
    const mode = searchParams.get('mode');
    const shouldBeProposalMode = mode === 'proposal';
    
    if (shouldBeProposalMode !== isProposalMode) {
      setProposalMode(shouldBeProposalMode);
    }
  }, [searchParams, isProposalMode, setProposalMode]);

  usePageMeta({
    title: isVendorMode ? "Create Proposal - Select Services" : "Marketplace - Find Perfect Vendors",
    description: isVendorMode ? "Select services from your inventory to create a proposal for your client." : "Browse our curated marketplace of catering, venues, party rentals, and staffing services for your next event."
  });

  const handleTabChange = useCallback((value: string) => {

    setActiveTab(value as any);
  }, [setActiveTab]);

  const handleTabHover = useCallback((tab: string) => {
    setHoveredTab(tab);
  }, []);

  const handleTabLeave = useCallback(() => {
    setHoveredTab(null);
  }, []);

  // Optimized marketplace content - only renders active tab
  const MarketplaceContent = useMemo(() => (
    <FilterProvider>
      <div className="w-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="space-y-6">
            <MarketplaceTabsList 
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onTabHover={handleTabHover}
              onTabLeave={handleTabLeave}
            />
            
            <MarketplaceHeader 
              activeTab={activeTab}
              existingServices={existingServices}
            />
            
            {/* Lazy load only the active tab for better performance */}
            <LazyTabLoader 
              activeTab={activeTab}
              existingServices={existingServices}
              isBookingMode={isBookingMode}
              vendorMode={isVendorMode}
            />
          </div>
        </Tabs>
      </div>
    </FilterProvider>
  ), [activeTab, handleTabChange, handleTabHover, handleTabLeave, existingServices, isBookingMode, isVendorMode]);

  const handleGroupOrderSubmit = (data: GroupOrderData) => {
    setShowGroupOrderModal(false);
    
    // Generate a mock invite token (in real app, this would come from backend)
    const inviteToken = 'cd95cd96c2f4e5234214af2029cb5cb4da5c6b2c5e95cc585018f80b89f04f46';
    
    setSuccessData({ ...data, inviteToken });
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (successData) {
      navigate('/admin/group-order/setup', {
        state: {
          formData: {
            orderName: successData.eventName,
            location: successData.address,
            date: successData.date,
            deliveryWindow: successData.time,
            primaryContactName: successData.contactName,
            primaryContactPhone: successData.phone,
            primaryContactEmail: successData.email,
            budgetPerPerson: parseFloat(successData.budgetPerPerson) || 0,
          },
        },
      });
    }
  };

  return (
    <Dashboard activeTab="vendors" userRole="admin">
      <div className="space-y-6">
        <InvoiceModeBanner />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isVendorMode ? "Create Invoice - Select Services" : "Marketplace"}
          </h1>
          <Button onClick={() => setShowGroupOrderModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Group Order
          </Button>
        </div>
        {MarketplaceContent}
      </div>
      <CartBadge />
      <AddGroupOrderModal
        open={showGroupOrderModal}
        onClose={() => setShowGroupOrderModal(false)}
        onSubmit={handleGroupOrderSubmit}
      />
      {successData && (
        <GroupOrderSuccessModal
          open={showSuccessModal}
          onClose={handleSuccessClose}
          eventName={successData.eventName}
          address={successData.address}
          date={successData.date}
          time={successData.time}
          budgetPerPerson={successData.budgetPerPerson}
          inviteToken={successData.inviteToken}
        />
      )}
    </Dashboard>
  );
};

export default VendorMarketPlace;
