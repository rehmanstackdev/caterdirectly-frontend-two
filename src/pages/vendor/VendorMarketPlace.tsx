
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';

const VendorMarketPlace = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { setInvoiceMode: setProposalMode, isInvoiceMode: isProposalMode } = useInvoice();
  const { activeTab, setActiveTab } = useMarketplaceTabs();
  const { user, userRole } = useAuth();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  // Extract booking mode and existing services from location state
  const locationState = location.state as any;
  const isBookingMode = Boolean(locationState?.bookingMode || locationState?.addingToExistingBooking || locationState?.addingAdditionalService);
  const existingServices = locationState?.currentBookingServices || locationState?.currentServices || [];
  
  // Vendor mode: default to true for vendor routes (since this is /vendor/marketplace)
  // Can be explicitly disabled via ?vendor=false URL param if needed
  const vendorParam = searchParams.get('vendor');
  const isVendorMode = vendorParam !== 'false'; // Default to true, only false if explicitly set

  
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

  return (
    <VendorDashboard activeTab="dashboard">
      <div className="space-y-6">
        <InvoiceModeBanner />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isVendorMode ? "Create Invoice - Select Services" : "Marketplace"}
          </h1>
        </div>
        {MarketplaceContent}
      </div>
      <CartBadge />
    </VendorDashboard>
  );
};

export default VendorMarketPlace;
