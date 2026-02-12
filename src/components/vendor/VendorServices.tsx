import React from "react";
import { VendorCard } from "@/components/marketplace/vendor-card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useServices } from "@/hooks/services/use-services";
import { Loader } from "lucide-react";
import { getCateringPriceRange } from "@/hooks/events/utils/menu-utils";

interface VendorServicesProps {
  vendorName: string;
}

const VendorServices = ({ vendorName }: VendorServicesProps) => {
  const navigate = useNavigate();
  const { services } = useServices();
  
  // Filter services by vendor name and approved status
  const vendorServices = services.filter(service => 
    service.vendorName === vendorName && 
    service.status === 'approved'
  );

  // Format the price properly based on service type and extract price type
  const getFormattedPriceAndType = (service: any) => {
    // Get the full price string from the service based on type
    let fullPrice = '';
    if (service.type === 'catering') {
      fullPrice = getCateringPriceRange(service);
    } else {
      fullPrice = service.price;
    }
    
    let price = fullPrice;
    let priceType = '';

    // Check if price already contains a price type
    if (typeof fullPrice === 'string') {
      if (fullPrice.includes('/Person') || fullPrice.toLowerCase().includes('/person')) {
        price = fullPrice.split('/Person')[0].split('/person')[0].trim();
        priceType = '/Person';
      } else if (fullPrice.includes('/Hour') || fullPrice.toLowerCase().includes('/hour')) {
        price = fullPrice.split('/Hour')[0].split('/hour')[0].trim();
        priceType = '/Hour';
      } else if (fullPrice.includes('/Day') || fullPrice.toLowerCase().includes('/day')) {
        price = fullPrice.split('/Day')[0].split('/day')[0].trim();
        priceType = '/Day';
      } else if (fullPrice.includes('/Item') || fullPrice.toLowerCase().includes('/item')) {
        price = fullPrice.split('/Item')[0].split('/item')[0].trim();
        priceType = '/Item';
      }
    }

    // If no price type was found in the price string, check the service's price_type
    if (!priceType && service.price_type) {
      if (service.price_type === 'per_person') {
        priceType = '/Person';
      } else if (service.price_type === 'per_hour') {
        priceType = '/Hour';
      } else if (service.price_type === 'per_day') {
        priceType = '/Day';
      } else if (service.price_type === 'per_item') {
        priceType = '/Item';
      }
    }

    return { price, priceType };
  };

  const handleBookService = (service: any) => {
    const { price, priceType } = getFormattedPriceAndType(service);
    
    navigate('/booking', {
      state: {
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: price,
        servicePriceType: priceType,
        serviceImage: service.image,
        serviceType: service.type,
        vendorName: service.vendorName,
        selectedServices: [{
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: price,
          servicePriceType: priceType,
          serviceImage: service.image,
          serviceType: service.type,
          vendorName: service.vendorName,
          quantity: 1,
          duration: 1
        }]
      }
    });
  };

  if (!vendorServices.length) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Services Offered</h2>
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500">This vendor hasn't published any services yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Services Offered</h2>
      {!vendorServices.length ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500">This vendor hasn't published any services yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorServices.map((service) => {
            const { price, priceType } = getFormattedPriceAndType(service);
            return (
              <div key={service.id} className="flex flex-col">
                <VendorCard
                  id={service.id}
                  image={service.image}
                  name={service.name}
                  vendorName={service.vendorName || vendorName}
                  rating={service.rating}
                  reviews={service.reviews}
                  location={service.location}
                  price={price}
                  priceType={priceType}
                  description={service.description}
                  available={service.available || true}
                  vendorType={service.type}
                  isManaged={service.isManaged}
                />
                <div className="mt-2">
                  <Button 
                    className="w-full bg-[#F07712] hover:bg-[#F07712]/90"
                    onClick={() => handleBookService(service)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorServices;
