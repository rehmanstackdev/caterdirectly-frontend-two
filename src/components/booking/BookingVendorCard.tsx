
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import VendorCardHeader from "./vendor-card/VendorCardHeader";
import VendorCardPricing from "./vendor-card/VendorCardPricing";
import VendorCardActions from "./vendor-card/VendorCardActions";
import QuantityControls from "./vendor-card/QuantityControls";
import ItemsSection from "./vendor-card/ItemsSection";
import { getBookableItems } from "./vendor-card/utils";
import { calculateServiceTotal as unifiedCalculateServiceTotal } from "@/utils/unified-calculations";
import { getSelectedItemsCountForService } from "@/utils/order-summary-utils";
import { getServiceImageUrl } from "@/utils/image-utils";
import { DeliveryRangesModal } from "./DeliveryRangesModal";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BookingVendorCardProps {
  vendorImage?: string;
  vendorName?: string;
  vendorType?: string;
  vendorPrice?: string;
  isManaged?: boolean;
  serviceDetails?: any;
  selectedItems?: Record<string, number>;
  onItemQuantityChange?: (itemId: string, quantity: number) => void;
  onComboSelection?: (comboSelections: any) => void;
  onRemoveService?: () => void;
  canRemove?: boolean;
  serviceIndex?: number;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  changeServicePath?: string;
  onChangeService?: () => void;
  showChangeService?: boolean;
  showChooseItems?: boolean;
  onDeliveryRangeSelect?: (serviceIndex: number, range: { range: string; fee: number }) => void;
  guestCount?: number;
  calculatedDistance?: number; // Distance in miles for auto-selection
  preselectedDeliveryFee?: { range: string; fee: number }; // Pre-selected delivery fee
}

const BookingVendorCard = React.memo(({
  vendorImage,
  vendorName,
  vendorType,
  vendorPrice,
  isManaged = false,
  serviceDetails,
  selectedItems = {},
  onItemQuantityChange = () => {},
  onComboSelection = () => {},
  onRemoveService,
  canRemove = false,
  serviceIndex = 0,
  quantity = 1,
  onQuantityChange = () => {},
  changeServicePath = '/marketplace',
  onChangeService,
  showChangeService = true,
  showChooseItems = true,
  onDeliveryRangeSelect,
  guestCount = 1,
  calculatedDistance,
  preselectedDeliveryFee
}: BookingVendorCardProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeliveryRanges, setShowDeliveryRanges] = useState(false);

  const bookableItems = getBookableItems(serviceDetails);
  const serviceType = serviceDetails?.serviceType || serviceDetails?.type || 'service';
  const hasBookableItems = bookableItems.length > 0;

  const serviceTotal = unifiedCalculateServiceTotal(serviceDetails, selectedItems, guestCount);
  const shouldShowPricing: boolean = serviceTotal > 0 || (!hasBookableItems && Boolean(vendorPrice));

  const serviceSelectedItemsCount = serviceDetails
    ? getSelectedItemsCountForService(serviceDetails, selectedItems)
    : 0;

  // Wrap combo callback to inject serviceId
  const serviceId = serviceDetails?.serviceId || serviceDetails?.id;
  const wrappedComboSelection = (selections: any) => {
    onComboSelection({ serviceId, selections });
  };

  const handleChangeService = onChangeService || (() => {
    navigate(changeServicePath, {
      state: {
        changingService: true,
        serviceIndex: serviceIndex,
        currentServices: [],
        selectedItems: selectedItems,
        formData: {}
      }
    });
  });

  const isRemovable: boolean = Boolean(canRemove);

  // Parse delivery ranges from service details
  const deliveryRanges = React.useMemo(() => {
    try {
      const ranges = serviceDetails?.deliveryRanges || 
                     serviceDetails?.service_details?.deliveryRanges ||
                     serviceDetails?.service_details?.catering?.deliveryRanges;
      if (typeof ranges === 'string') {
        return JSON.parse(ranges);
      }
      return Array.isArray(ranges) ? ranges : [];
    } catch {
      return [];
    }
  }, [serviceDetails]);

  const hasDeliveryRanges = deliveryRanges.length > 0;

  return (
    <div className="w-full overflow-x-hidden">
      <Card className="bg-white shadow-sm border border-gray-100 w-full max-w-full overflow-x-hidden">
        <CardContent className="p-4 md:p-6 w-full overflow-x-hidden">
          <div className="space-y-4 w-full overflow-x-hidden">
            {/* Header section - responsive layout */}
            <div className="w-full overflow-x-hidden">
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start sm:gap-4 w-full overflow-x-hidden">
                <div className="flex-1 w-full overflow-x-hidden">
                  <VendorCardHeader
                    vendorImage={vendorImage || getServiceImageUrl(serviceDetails)}
                    vendorName={vendorName}
                    vendorType={vendorType}
                    isManaged={isManaged}
                  />
                </div>
                
                <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-4 w-full sm:w-auto sm:flex-shrink-0 overflow-x-hidden">
                  <div className="w-full sm:w-auto overflow-x-hidden">
                    <VendorCardPricing
                      serviceTotal={serviceTotal}
                      vendorPrice={vendorPrice}
                      serviceSelectedItemsCount={serviceSelectedItemsCount}
                      shouldShowPricing={shouldShowPricing}
                    />
                  </div>
                  
                  <div className="w-full sm:w-auto flex-shrink-0 overflow-x-hidden">
                    <VendorCardActions
                      hasBookableItems={hasBookableItems}
                      showChooseItems={showChooseItems}
                      isExpanded={isExpanded}
                      setIsExpanded={setIsExpanded}
                      bookableItemsCount={bookableItems.length}
                      onChangeService={handleChangeService}
                      canRemove={isRemovable}
                      onRemoveService={onRemoveService}
                      selectedItemsCount={serviceSelectedItemsCount}
                      showChangeService={showChangeService}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Ranges Section */}
            {hasDeliveryRanges && (
              <div className="pt-2 border-t border-gray-100 w-full overflow-x-hidden">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeliveryRanges(true)}
                    className="flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    View Delivery Ranges
                  </Button>
                  {preselectedDeliveryFee && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <Truck className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Delivery Fee: <span className="font-semibold">${preselectedDeliveryFee.fee}</span>
                        <span className="text-xs text-green-600 ml-1">({preselectedDeliveryFee.range})</span>
                      </span>
                    </div>
                  )}
                  {calculatedDistance && calculatedDistance > 0 && !preselectedDeliveryFee && (
                    <div className="text-xs text-muted-foreground">
                      Distance: {calculatedDistance.toFixed(1)} miles
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity controls for services without sub-items */}
            {!hasBookableItems && (
              <div className="pt-2 border-t border-gray-100 w-full overflow-x-hidden">
                <QuantityControls
                  quantity={quantity}
                  onQuantityChange={onQuantityChange}
                  serviceType={serviceType}
                />
              </div>
            )}

            {/* Items section */}
            {hasBookableItems && (
              <div className="w-full overflow-x-hidden">
                <ItemsSection
                  isExpanded={isExpanded}
                  serviceType={serviceType}
                  bookableItems={bookableItems}
                  selectedItems={selectedItems}
                  onItemQuantityChange={onItemQuantityChange}
                  onComboSelection={wrappedComboSelection}
                />
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Delivery Ranges Modal */}
      {hasDeliveryRanges && (
        <DeliveryRangesModal
          isOpen={showDeliveryRanges}
          onClose={() => setShowDeliveryRanges(false)}
          deliveryRanges={deliveryRanges}
          vendorName={vendorName}
          calculatedDistance={calculatedDistance}
          preselectedRange={preselectedDeliveryFee}
          onSelectRange={(range) => {
            if (onDeliveryRangeSelect) {
              onDeliveryRangeSelect(serviceIndex, range);
            }
          }}
        />
      )}
    </div>
  );
});

BookingVendorCard.displayName = 'BookingVendorCard';

export default BookingVendorCard;
