import { Suspense, lazy } from 'react';
import { ServiceSelection } from '@/types/order';
import MarketplaceSkeleton from './MarketplaceSkeleton';

// Lazy load tab components for better performance
const AllTab = lazy(() => import('./tabs/AllTab'));
const CateringTab = lazy(() => import('./tabs/CateringTab'));
const VenuesTab = lazy(() => import('./tabs/VenuesTab'));
const PartyRentalsTab = lazy(() => import('./tabs/PartyRentalsTab'));
const StaffTab = lazy(() => import('./tabs/StaffTab'));

interface LazyTabLoaderProps {
  activeTab: string;
  existingServices: ServiceSelection[];
  isBookingMode: boolean;
  vendorMode: boolean;
}

const LazyTabLoader = ({ 
  activeTab, 
  existingServices, 
  isBookingMode, 
  vendorMode 
}: LazyTabLoaderProps) => {
  const renderActiveTab = () => {
    const commonProps = {
      isTabLoaded: true,
      existingServices,
      isBookingMode,
      vendorMode
    };

    switch (activeTab) {
      case 'all':
        return <AllTab {...commonProps} />;
      case 'catering':
        return <CateringTab {...commonProps} />;
      case 'venues':
        return <VenuesTab {...commonProps} />;
      case 'party-rentals':
        return <PartyRentalsTab {...commonProps} />;
      case 'staff':
        return <StaffTab {...commonProps} />;
      default:
        return <AllTab {...commonProps} />;
    }
  };

  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      {renderActiveTab()}
    </Suspense>
  );
};

export default LazyTabLoader;