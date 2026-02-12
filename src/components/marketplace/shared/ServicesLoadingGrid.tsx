

import ServiceCardSkeleton from '@/components/shared/ServiceCardSkeleton';

interface ServicesLoadingGridProps {
  count?: number;
  type?: string;
}

const ServicesLoadingGrid = ({ 
  count = 6,
  type = 'service'
}: ServicesLoadingGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
      {Array(count).fill(0).map((_, index) => (
        <ServiceCardSkeleton key={`${type}-skeleton-${index}`} />
      ))}
    </div>
  );
};

export default ServicesLoadingGrid;
