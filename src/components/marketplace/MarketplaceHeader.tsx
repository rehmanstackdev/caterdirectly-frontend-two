
import { useState } from 'react';
import CateringFilters from './filters/CateringFilters';
import VenueFilters from './filters/VenueFilters';
import PartyRentalFilters from './filters/PartyRentalFilters';
import StaffingFilters from './filters/StaffingFilters';
import { ServiceSelection } from '@/types/order';

interface MarketplaceHeaderProps {
  activeTab: string;
  existingServices?: ServiceSelection[];
}

const MarketplaceHeader = ({
  activeTab,
  existingServices = []
}: MarketplaceHeaderProps) => {
  const renderFilters = () => {
    switch (activeTab) {
      case "catering":
        return <CateringFilters existingServices={existingServices} />;
      case "venues":
        return <VenueFilters existingServices={existingServices} />;
      case "party-rentals":
        return <PartyRentalFilters existingServices={existingServices} />;
      case "staff":
        return <StaffingFilters existingServices={existingServices} />;
      default:
        return <CateringFilters existingServices={existingServices} />;
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-full">
      <div className="w-full">
        {renderFilters()}
      </div>
    </div>
  );
};

export default MarketplaceHeader;
