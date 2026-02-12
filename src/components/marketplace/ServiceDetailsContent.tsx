
import { Star } from "lucide-react";
import ServiceImage from '@/components/shared/ServiceImage';
import { ServiceItem } from '@/types/service-types';
import { getServiceImageUrl } from '@/utils/image-utils';
import { getMenuItems } from '@/hooks/events/utils/menu-utils';
import CateringMenuDisplay from '@/components/vendor/services/detail/CateringMenuDisplay';
import { AdminMarketplaceActions } from '@/components/admin/marketplace/AdminMarketplaceActions';
import { formatUnifiedServicePrice } from '@/utils/unified-price-utils';
import { useAuth } from '@/contexts/auth';

interface ServiceDetailsContentProps {
  service: ServiceItem;
  onCreateProposal: (service: ServiceItem) => void;
  onEditService: (serviceId: string) => void;
}

function ServiceDetailsContent({
  service,
  onCreateProposal,
  onEditService
}: ServiceDetailsContentProps) {
  const { user } = useAuth();
  
  // Use unified image resolution system that handles the priority automatically
  const displayImage = getServiceImageUrl(service);
  
  console.log(`[ServiceDetailsContent] Service ${service.id} - ${service.name}, image: ${displayImage}`);
  
  // Get menu items if this is a catering service
  const menuItems = service.type === 'catering' ? getMenuItems(service) : [];
  const hasCateringMenu = menuItems.length > 0;

  // Get consistent price display using the unified formatter
  const priceDisplay = formatUnifiedServicePrice(service);
  
  // Check if user is admin (simplified check - you should implement proper role checking)
  const isAdmin = user?.email && user.email.includes('admin');

  return (
    <div className="flex-1 overflow-y-auto px-1 space-y-3 sm:space-y-4 min-h-0">
      <div className="relative w-full aspect-video rounded-md overflow-hidden">
        <ServiceImage 
          src={displayImage}
          alt={service.name}
          className="w-full h-full object-cover"
          imageId={`service-details-${service.id}`}
          aspectRatio="aspect-video"
          showLoadingPlaceholder={true}
          service={service}
          onError={() => console.log(`[ServiceDetailsContent] Image failed to load for service: ${service.id}`)}
        />
      </div>
      
      <div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 xs:gap-0">
        <div className="flex items-center">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current mr-1" />
          <span className="ml-1 font-medium text-sm sm:text-base">{service.rating}</span>
          <span className="text-gray-500 text-xs sm:text-sm ml-1">({service.reviews} reviews)</span>
        </div>
        <div className="font-semibold text-base sm:text-lg text-[#F07712] break-words">
          {priceDisplay}
        </div>
      </div>
      
      <p className="text-gray-700 text-sm sm:text-base break-words hyphens-auto leading-relaxed">
        {service.description}
      </p>
      
      {/* Display menu items for catering services */}
      {service.type === 'catering' && hasCateringMenu && (
        <div className="overflow-hidden">
          <h3 className="text-base sm:text-lg font-medium mb-2">Menu Items</h3>
          <div className="overflow-x-hidden">
            <CateringMenuDisplay menuItems={menuItems} />
          </div>
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <AdminMarketplaceActions
          service={service}
          onCreateProposal={onCreateProposal}
          onEditService={onEditService}
        />
      )}
    </div>
  );
};

export default ServiceDetailsContent;
