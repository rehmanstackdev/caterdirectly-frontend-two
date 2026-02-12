

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ServiceImage from '@/components/shared/ServiceImage';
import { getMenuImageUrl } from '@/hooks/events/utils/menu-utils';
import { ServiceItem } from '@/types/service-types';

interface CateringMenuImageProps {
  service: ServiceItem;
}

const CateringMenuImage = ({ service }: CateringMenuImageProps) => {
  const menuImageUrl = getMenuImageUrl(service);

  if (!menuImageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Menu Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 bg-gray-50 rounded-md">
            <p className="text-gray-500">No menu image has been uploaded for this service.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Menu Image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-[16/9] rounded-md overflow-hidden">
          <ServiceImage 
            src={menuImageUrl}
            alt="Menu Image"
            className="w-full h-full object-contain"
            aspectRatio="aspect-[16/9]"
            imageId="menu-image"
            showLoadingPlaceholder={true}
            service={service}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Menu image path: {menuImageUrl}
        </p>
      </CardContent>
    </Card>
  );
};

export default CateringMenuImage;
