import React from 'react';
import { CateringServiceDetails } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CateringMenuDisplay from './CateringMenuDisplay';
import ServiceImage from '@/components/shared/ServiceImage';

interface CateringServiceDetailsViewProps {
  details: CateringServiceDetails;
}

const CateringServiceDetailsView: React.FC<CateringServiceDetailsViewProps> = ({ details }) => {
  if (!details) return null;
  
  // Extract menu items from the correct nested structure
  const menuItems = details.menuItems || [];
  
  const formatOptionName = (option: string) => {
    return option
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      {/* Display Menu Image if available */}
      {details.menuImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Menu Photo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/9] w-full rounded-md overflow-hidden">
              <ServiceImage 
                src={details.menuImage}
                alt="Menu Photo"
                className="w-full h-full object-cover"
                aspectRatio="aspect-[16/9]"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {details.serviceStyles && Array.isArray(details.serviceStyles) && details.serviceStyles.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900">Service Style Options</h3>
              <p className="text-sm text-gray-500 mb-2">You'll select one style when booking</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {details.serviceStyles.map((style) => (
                  <Badge key={style} variant="outline" className="bg-gray-100">
                    {formatOptionName(style)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {details.minimumOrderAmount !== undefined && (
            <div>
              <h3 className="font-semibold text-gray-900">Minimum Order Amount</h3>
              <p className="mt-1 text-gray-600">{formatCurrency(details.minimumOrderAmount)} total order minimum</p>
            </div>
          )}
          
          {details.leadTimeHours && (
            <div>
              <h3 className="font-semibold text-gray-900">Lead Time Required</h3>
              <p className="mt-1 text-gray-600">{details.leadTimeHours} hours</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Menu Items Display */}
      {menuItems && Array.isArray(menuItems) && menuItems.length > 0 && (
        <CateringMenuDisplay menuItems={menuItems} />
      )}
      
      {/* Packaging Options */}
      {details.packagingOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Packaging Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {details.packagingOptions.disposable && (
              <div className="flex justify-between">
                <span>Disposable Packaging</span>
                {details.packagingOptions.disposableFee > 0 ? (
                  <span className="font-medium">{formatCurrency(details.packagingOptions.disposableFee)}</span>
                ) : (
                  <span className="text-green-600">Free</span>
                )}
              </div>
            )}
            
            {details.packagingOptions.reusable && (
              <div>
                <div className="flex justify-between">
                  <span>Reusable Packaging Setup & Pickup</span>
                  {details.packagingOptions.reusableFeeType === 'percentage' ? (
                    <span className="font-medium">{details.packagingOptions.reusableServiceFeePercentage || 0}% of order</span>
                  ) : details.packagingOptions.reusableServiceFeeFlatRate > 0 ? (
                    <span className="font-medium">{formatCurrency(details.packagingOptions.reusableServiceFeeFlatRate)}</span>
                  ) : (
                    <span className="text-green-600">Free</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Includes delivery, setup, and pickup service</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Delivery Options */}
      {details.deliveryOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {details.deliveryOptions.delivery && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Delivery Available
                </Badge>
              )}
              
              {details.deliveryOptions.pickup && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  Pickup Available
                </Badge>
              )}
            </div>
            
            {details.deliveryOptions.delivery && details.deliveryOptions.deliveryMinimum > 0 && (
              <div>
                <h4 className="font-medium text-gray-900">Minimum Order for Delivery</h4>
                <p className="text-gray-600">{formatCurrency(details.deliveryOptions.deliveryMinimum)}</p>
              </div>
            )}
            
            {details.deliveryOptions.delivery && details.deliveryOptions.deliveryRanges && (
              <div>
                <h4 className="font-medium text-gray-900">Delivery Fees</h4>
                <div className="mt-2 space-y-2">
                  {details.deliveryOptions.deliveryRanges.map((range, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{range.range}</span>
                      {range.fee > 0 ? (
                        <span className="font-medium">{formatCurrency(range.fee)}</span>
                      ) : (
                        <span className="text-green-600">Free</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Service Additions */}
      {details.serviceAdditions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Additions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {details.serviceAdditions.providesUtensils && (
              <div className="flex justify-between">
                <span>Utensils</span>
                {details.serviceAdditions.utensilsFee > 0 ? (
                  <span className="font-medium">{formatCurrency(details.serviceAdditions.utensilsFee)}</span>
                ) : (
                  <span className="text-green-600">Free</span>
                )}
              </div>
            )}
            
            {details.serviceAdditions.providesPlates && (
              <div className="flex justify-between">
                <span>Plates</span>
                {details.serviceAdditions.platesFee > 0 ? (
                  <span className="font-medium">{formatCurrency(details.serviceAdditions.platesFee)}</span>
                ) : (
                  <span className="text-green-600">Free</span>
                )}
              </div>
            )}
            
            {details.serviceAdditions.providesNapkins && (
              <div className="flex justify-between">
                <span>Napkins</span>
                {details.serviceAdditions.napkinsFee > 0 ? (
                  <span className="font-medium">{formatCurrency(details.serviceAdditions.napkinsFee)}</span>
                ) : (
                  <span className="text-green-600">Free</span>
                )}
              </div>
            )}
            
            {details.serviceAdditions.providesServingUtensils && (
              <div className="flex justify-between">
                <span>Serving Utensils</span>
                {details.serviceAdditions.servingUtensilsFee > 0 ? (
                  <span className="font-medium">{formatCurrency(details.serviceAdditions.servingUtensilsFee)}</span>
                ) : (
                  <span className="text-green-600">Free</span>
                )}
              </div>
            )}
            
            {details.serviceAdditions.providesLabels && (
              <div className="flex justify-between">
                <span>Labels</span>
                <span className="text-green-600">Free</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CateringServiceDetailsView;
