import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Tabs } from '@/components/ui/tabs';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceTabsList from '@/components/marketplace/MarketplaceTabsList';
import LazyTabLoader from '@/components/marketplace/LazyTabLoader';
import { useMarketplaceTabs } from '@/hooks/use-marketplace-tabs';
import { usePageMeta } from '@/hooks/use-page-meta';
import { FilterProvider } from '@/contexts/FilterContext';
import CartBadge from '@/components/marketplace/CartBadge';

const GroupOrderMarketplace = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { activeTab, setActiveTab } = useMarketplaceTabs();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Extract booking mode and existing services from location state
  const locationState = location.state as any;
  const isBookingMode = Boolean(locationState?.bookingMode || locationState?.addingToExistingBooking || locationState?.addingAdditionalService);
  const existingServices = locationState?.currentBookingServices || locationState?.currentServices || [];

  usePageMeta({
    title: "Group Order Marketplace - Select Services",
    description: "Browse and select catering services for your group order event."
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
              vendorMode={false}
            />
          </div>
        </Tabs>
      </div>
    </FilterProvider>
  ), [activeTab, handleTabChange, handleTabHover, handleTabLeave, existingServices, isBookingMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Group Order Marketplace</h1>
          {MarketplaceContent}
        </div>
      </main>
      <Footer />
      <CartBadge />
    </div>
  );
};

export default GroupOrderMarketplace;
