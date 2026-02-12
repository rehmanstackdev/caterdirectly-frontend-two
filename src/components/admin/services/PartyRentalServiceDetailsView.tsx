import { ServiceItem } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceImage from '@/components/shared/ServiceImage';
import { 
  DollarSign, 
  Package, 
  Wrench, 
  Truck, 
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';

export interface PartyRentalServiceDetailsViewProps {
  service: ServiceItem;
}

const PartyRentalServiceDetailsView = ({ service }: PartyRentalServiceDetailsViewProps) => {
  const partyRental = service.service_details?.partyRental || service.partyRental;

  if (!partyRental) {
    return <div className="text-gray-400">No party rental details available</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPricingType = (type: string) => {
    if (!type) return 'Not specified';
    const types: Record<string, string> = {
      'hourly_rate': 'Hourly Rate',
      'daily_rate': 'Daily Rate',
      'flat_rate': 'Flat Rate',
      'per_item': 'Per Item',
      'per_day': 'Per Day',
      'per_hour': 'Per Hour'
    };
    return types[type] || type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Service Image */}
      {partyRental.serviceImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Service Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-2xl mx-auto">
              <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border">
                <ServiceImage 
                  src={partyRental.serviceImage}
                  alt={service.name || service.serviceName}
                  className="w-full h-full object-cover"
                  imageId={`party-rental-${service.id}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing & Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pricing Type</p>
              <Badge variant="secondary" className="text-sm">
                {formatPricingType(partyRental.pricingType || partyRental.pricing_type)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Base Price</p>
              <p className="text-2xl font-bold text-[#F07712]">
                {formatCurrency(partyRental.price)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Setup Required</p>
              <div className="flex items-center gap-2">
                {partyRental.setupRequired || partyRental.setup_required ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">No</span>
                  </>
                )}
              </div>
            </div>
            {(partyRental.setupRequired || partyRental.setup_required) && partyRental.setupFee && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Setup Fee</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(partyRental.setupFee || partyRental.setup_fee)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(partyRental.availableQuantity || partyRental.available_quantity) && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Available Quantity</p>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">
                    {partyRental.availableQuantity || partyRental.available_quantity}
                  </p>
                  <span className="text-gray-500">units</span>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Service Name</p>
              <p className="font-medium text-gray-900">{service.name || service.serviceName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Options - Only show if at least one option is available */}
      {((partyRental.deliveryAvailable || partyRental.delivery_available) || 
        (partyRental.customerPickupAvailable || partyRental.customer_pickup_available)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery & Pickup Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(partyRental.deliveryAvailable || partyRental.delivery_available) && (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Delivery Available</p>
                    <p className="text-sm text-gray-600">We can deliver to your location</p>
                  </div>
                </div>
              )}
              {(partyRental.customerPickupAvailable || partyRental.customer_pickup_available) && (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Customer Pickup Available</p>
                    <p className="text-sm text-gray-600">You can pick up from our location</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {service.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {service.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartyRentalServiceDetailsView;