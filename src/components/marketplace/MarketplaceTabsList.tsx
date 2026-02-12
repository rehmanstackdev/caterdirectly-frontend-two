
import { useCallback } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFilterContext } from '@/contexts/FilterContext';

interface MarketplaceTabsListProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onTabHover?: (tab: string) => void;
  onTabLeave?: () => void;
}

const MarketplaceTabsList = ({
  activeTab,
  onTabChange,
  onTabHover,
  onTabLeave
}: MarketplaceTabsListProps) => {
  const isMobile = useIsMobile();
  const { clearAllServiceFilters } = useFilterContext();

  // Handle tab change with filter clearing
  const handleTabChange = useCallback((value: string) => {
    // Clear all service-specific filters when switching tabs
    if (value !== activeTab) {
      clearAllServiceFilters();
    }
    onTabChange(value);
  }, [activeTab, clearAllServiceFilters, onTabChange]);

  return (
    <TabsList className="grid w-full grid-cols-5 h-12">
      <TabsTrigger
        value="all"
        className="text-sm font-medium"
        onClick={() => handleTabChange('all')}
        onMouseEnter={() => onTabHover?.('all')}
        onMouseLeave={onTabLeave}
      >
        All
      </TabsTrigger>
      <TabsTrigger
        value="catering"
        className="text-sm font-medium"
        onClick={() => handleTabChange('catering')}
        onMouseEnter={() => onTabHover?.('catering')}
        onMouseLeave={onTabLeave}
      >
        Catering
      </TabsTrigger>
      <TabsTrigger
        value="venues"
        className="text-sm font-medium"
        onClick={() => handleTabChange('venues')}
        onMouseEnter={() => onTabHover?.('venues')}
        onMouseLeave={onTabLeave}
      >
        Venues
      </TabsTrigger>
      <TabsTrigger
        value="party-rentals"
        className="text-sm font-medium"
        onClick={() => handleTabChange('party-rentals')}
        onMouseEnter={() => onTabHover?.('party-rentals')}
        onMouseLeave={onTabLeave}
      >
        {isMobile ? "Rentals" : "Party Rentals"}
      </TabsTrigger>
      <TabsTrigger
        value="staff"
        className="text-sm font-medium"
        onClick={() => handleTabChange('staff')}
        onMouseEnter={() => onTabHover?.('staff')}
        onMouseLeave={onTabLeave}
      >
        Staff
      </TabsTrigger>
    </TabsList>
  );
};

export default MarketplaceTabsList;
