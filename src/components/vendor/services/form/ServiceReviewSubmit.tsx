import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check } from 'lucide-react';
import { ServiceType, PriceType } from '@/types/service-types';
import { VendorInfo } from '@/hooks/vendor/types/form-types';
import ServiceImage from '@/components/shared/ServiceImage';
import { formatUnifiedServicePrice } from '@/utils/unified-price-utils';

interface ServiceReviewSubmitProps {
  formData: {
    name: string;
    type: ServiceType;
    price: string;
    priceType: PriceType;
    description?: string;
    image?: string;
    cateringDetails?: {
      menuItems?: Array<{
        name: string;
        price: number;
        priceType: PriceType;
      }>;
      menuImage?: string; // Added field for overall menu image
    };
    // Other form data
  };
  isValid: boolean;
  onSubmit: () => void;
  submitForApproval?: boolean;
  vendorInfo?: VendorInfo;
  adminContext?: boolean;
}

const ServiceReviewSubmit: React.FC<ServiceReviewSubmitProps> = ({ 
  formData, 
  isValid, 
  onSubmit,
  submitForApproval = false,
  vendorInfo,
  adminContext = false
}) => {
  // Format price display using the unified formatter
  const formatPriceDisplay = () => {
    // For catering services, show menu items count instead of a single price
    if (formData.type === 'catering') {
      const menuItemCount = formData.cateringDetails?.menuItems?.length || 0;
      return `${menuItemCount} menu item${menuItemCount !== 1 ? 's' : ''}`;
    }
    
    // Create a mock service item to use the unified formatter
    const mockService = {
      price: formData.price ? `$${formData.price}` : '$0',
      price_type: formData.priceType,
      type: formData.type
    };
    
    return formatUnifiedServicePrice(mockService as any);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-2 border-dashed">
        <h3 className="font-semibold text-lg mb-4">Review Your Service</h3>
        <div className="space-y-4">
          {/* Display menu image if available for catering services */}
          {formData.type === 'catering' && formData.cateringDetails?.menuImage && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Menu Photo</p>
              <div className="aspect-[16/9] h-48 rounded-md overflow-hidden">
                <ServiceImage 
                  src={formData.cateringDetails.menuImage} 
                  alt={formData.name} 
                  className="w-full h-full object-cover" 
                  aspectRatio="aspect-[16/9]"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Service Name</p>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Service Type</p>
              <p className="font-medium capitalize">{formData.type.replace('-', ' ')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">
              {formData.type === 'catering' ? 'Menu Items' : 'Price'}
            </p>
            <p className="font-medium">
              {formatPriceDisplay()}
            </p>
          </div>
          
          {formData.description && (
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-sm">{formData.description}</p>
            </div>
          )}

          {vendorInfo && (
            <div>
              <p className="text-sm text-gray-500">Vendor</p>
              <p className="text-sm">{vendorInfo.vendorName}</p>
            </div>
          )}

          {adminContext && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <span className="font-semibold">Admin mode:</span> This service will be created as approved and active
              </p>
            </div>
          )}
        </div>
      </Card>
      
      {!isValid && (
        <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-4 rounded-md">
          <AlertTriangle className="w-5 h-5" />
          <p>Please complete all required fields before submitting.</p>
        </div>
      )}
      
      {/* <div className="flex justify-end">
        <Button 
          disabled={!isValid} 
          onClick={onSubmit} 
          className="bg-[#F07712] hover:bg-[#F07712]/90"
        >
          <Check className="w-4 h-4 mr-2" />
          {adminContext ? 'Create Service' : submitForApproval ? 'Submit for Approval' : 'Save Service'}
        </Button>
      </div> */}
    </div>
  );
};

export default ServiceReviewSubmit;
