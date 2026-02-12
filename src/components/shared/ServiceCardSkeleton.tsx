
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceCardSkeletonProps {
  variant?: 'default' | 'venue' | 'caterer';
}

const ServiceCardSkeleton = ({ variant = 'default' }: ServiceCardSkeletonProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm h-full transition-opacity">
      {/* Image placeholder */}
      <Skeleton className={`w-full ${variant === 'venue' ? 'h-48' : 'aspect-video'}`} />
      
      <div className="p-4 space-y-3">
        {/* Title placeholder */}
        <Skeleton className="h-6 w-3/4" />
        
        {/* Details placeholders */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        
        {/* Description placeholder */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        
        {/* Button placeholder */}
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
};

export default ServiceCardSkeleton;
