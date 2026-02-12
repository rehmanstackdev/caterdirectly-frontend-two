
import { ServiceSelection } from "@/types/order";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ServiceImage from "@/components/shared/ServiceImage";
import { calculateServiceTotal, getServiceName, getServicePrice } from "@/utils/order-summary-utils";

interface ServiceDetailsProps {
  services: ServiceSelection[];
  selectedItems: Record<string, number>;
}

const ServiceDetails = ({ services, selectedItems }: ServiceDetailsProps) => {
  console.log('[ServiceDetails] Rendering with selectedItems:', selectedItems);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Service Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service, index) => {
          const serviceTotal = calculateServiceTotal(service, selectedItems);
          const servicePrice = getServicePrice(service);
          
          console.log(`[ServiceDetails] Service ${service.serviceType}: total=${serviceTotal}, basePrice=${servicePrice}`);
          
          return (
            <div key={index} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
              <div className="w-20 h-20 rounded overflow-hidden">
                {(service.serviceImage || service.image) && (
                  <ServiceImage
                    src={service.serviceImage || service.image || ""}
                    alt={getServiceName(service)}
                    className="w-full h-full object-cover"
                    aspectRatio="aspect-square"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">{getServiceName(service)}</h3>
                <p className="text-gray-600">Provided by {service.vendorName || service.vendor || "Vendor"}</p>
                
                {/* Show quantity/duration information */}
                {service.quantity > 1 && (
                  <p className="text-sm text-gray-600">
                    {(service.serviceType === 'catering') ? 'Orders' : 'Quantity'}: {service.quantity}
                  </p>
                )}
                
                {/* Display duration - prioritize selectedItems duration for staff services */}
                {(() => {
                  const serviceId = service.id || service.serviceId;
                  const durationKey = `${serviceId}_duration`;
                  const selectedDuration = selectedItems[durationKey];
                  const displayDuration = selectedDuration || service.duration;
                  
                  if (displayDuration && displayDuration > 1 && 
                     (service.serviceType === 'staff' || service.serviceType === 'venue')) {
                    return (
                      <p className="text-sm text-gray-600">
                        {service.serviceType === 'staff' ? 'Hours: ' : 'Duration: '}
                        {displayDuration} hours
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="text-right">
                <p className="text-[#F07712] font-medium">
                  ${serviceTotal.toFixed(2)}
                </p>
                {((service.quantity > 1) || 
                  (service.duration && service.duration > 1 && 
                   (service.serviceType === 'staff' || service.serviceType === 'venue'))) ? (
                  <p className="text-xs text-gray-500">
                    ${servicePrice.toFixed(2)}
                    {service.serviceType === 'staff' || service.serviceType === 'venue' 
                      ? '/hour' 
                      : ' each'}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ServiceDetails;
