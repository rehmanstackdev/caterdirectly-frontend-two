import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  Wrench, 
  Truck, 
  CheckCircle2,
  Hash
} from 'lucide-react';

interface PartyRentalServiceDetailsViewProps {
  details: any;
}

const PartyRentalServiceDetailsView: React.FC<PartyRentalServiceDetailsViewProps> = ({ details }) => {
  if (!details) return null;

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
    return types[type] || type.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
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
                {formatPricingType(details.pricingType || details.pricing_type)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Base Price</p>
              <p className="text-2xl font-bold text-[#F07712]">
                {formatCurrency(details.price)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Setup Required</p>
              <div className="flex items-center gap-2">
                {details.setupRequired || details.setup_required ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-700">Yes</span>
                  </>
                ) : (
                  <span className="text-gray-600">No</span>
                )}
              </div>
            </div>
            {(details.setupRequired || details.setup_required) && details.setupFee && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Setup Fee</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(details.setupFee || details.setup_fee)}
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
            {(details.availableQuantity || details.available_quantity) && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Available Quantity</p>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">
                    {details.availableQuantity || details.available_quantity}
                  </p>
                  <span className="text-gray-500">units</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delivery Options - Only show if at least one option is available */}
      {((details.deliveryAvailable || details.delivery_available) || 
        (details.customerPickupAvailable || details.customer_pickup_available)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery & Pickup Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(details.deliveryAvailable || details.delivery_available) && (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-700">Delivery Available</p>
                    <p className="text-sm text-gray-600">We can deliver to your location</p>
                  </div>
                </div>
              )}
              {(details.customerPickupAvailable || details.customer_pickup_available) && (
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
    </div>
  );
};

export default PartyRentalServiceDetailsView;
