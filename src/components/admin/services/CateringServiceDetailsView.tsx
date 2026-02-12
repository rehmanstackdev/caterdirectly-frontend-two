

import { ServiceItem } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ServiceImage from '@/components/shared/ServiceImage';

export interface CateringServiceDetailsViewProps {
  service: ServiceItem;
}

const CateringServiceDetailsView = ({ service }: CateringServiceDetailsViewProps) => {
  // Helper to extract service styles
  const getServiceStyles = () => {
    try {
      if (service.service_details?.catering?.serviceStyles) {
        return service.service_details.catering.serviceStyles;
      }
      if (service.service_details?.serviceStyles) {
        return service.service_details.serviceStyles;
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  // Helper to extract menu items
  const getMenuItems = () => {
    try {
      if (service.service_details?.catering?.menuItems) {
        return service.service_details.catering.menuItems;
      }
      if (service.service_details?.menuItems) {
        return service.service_details.menuItems;
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  // Helper to extract dietary options
  const getDietaryOptions = () => {
    try {
      if (service.service_details?.catering?.dietaryOptions) {
        return service.service_details.catering.dietaryOptions;
      }
      if (service.service_details?.dietaryOptions) {
        return service.service_details.dietaryOptions;
      }
      return [];
    } catch (err) {
      return [];
    }
  };

  const serviceStyles = getServiceStyles();
  const menuItems = getMenuItems();
  const dietaryOptions = getDietaryOptions();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Service Type</p>
                <p className="capitalize">{service.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pricing</p>
                <p>{service.price}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Service Styles</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {serviceStyles && serviceStyles.length > 0 ? (
                    serviceStyles.map((style, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                        {style.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No service styles specified</span>
                  )}
                </div>
              </div>
              {service.service_details?.minimumOrderAmount && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Minimum Order</p>
                  <p>{service.service_details.minimumOrderAmount} {service.service_details.minimumOrderType || 'people'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Only show Dietary Information card if there's actual data */}
        {((dietaryOptions && dietaryOptions.length > 0) || service.service_details?.allergenInfo) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dietary Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dietaryOptions && dietaryOptions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dietary Options</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dietaryOptions.map((option, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs capitalize">
                          {option.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {service.service_details?.allergenInfo && service.service_details.allergenInfo.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Allergen Information</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {service.service_details.allergenInfo.map((allergen, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs capitalize">
                          {allergen.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {menuItems && menuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item, index) => {
                // Parse dietary options and allergens from comma-separated strings
                const dietaryOptions = item.dietaryOptions 
                  ? (typeof item.dietaryOptions === 'string' 
                      ? item.dietaryOptions.split(',').map(o => o.trim()).filter(Boolean)
                      : item.dietaryOptions)
                  : [];
                const allergens = item.allergens 
                  ? (typeof item.allergens === 'string' 
                      ? item.allergens.split(',').map(a => a.trim()).filter(Boolean)
                      : item.allergens)
                  : [];

                return (
                  <div key={index} className="flex gap-3 p-3 border rounded-lg">
                    {(item.imageUrl || item.image) && (
                      <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0 border">
                        <img
                          src={item.imageUrl || item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      {item.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>}
                      
                      {/* Dietary Options and Allergens */}
                      {(dietaryOptions.length > 0 || allergens.length > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dietaryOptions.map((option, idx) => (
                            <span key={`diet-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              {option.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {allergens.map((allergen, idx) => (
                            <span key={`allergen-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              ⚠ {allergen.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.price && <p className="text-sm font-semibold text-[#F07712] mt-2">${item.price}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No menu items available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CateringServiceDetailsView;
