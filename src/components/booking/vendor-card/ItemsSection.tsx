
import React from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import ServiceItemsList from "../ServiceItemsList";
import ComboItemsList from "../ComboItemsList";

interface ItemsSectionProps {
  isExpanded: boolean;
  serviceType: string;
  bookableItems: any[];
  selectedItems: Record<string, number>;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
  onComboSelection?: (comboSelections: any) => void;
}

const ItemsSection = React.memo(({
  isExpanded,
  serviceType,
  bookableItems,
  selectedItems,
  onItemQuantityChange,
  onComboSelection
}: ItemsSectionProps) => {
  const getSectionTitle = (serviceType: string) => {
    switch (serviceType) {
      case 'catering':
        return 'Menu Items';
      case 'party-rental':
      case 'party-rentals':
        return 'Rental Items';
      case 'staff':
        return 'Staff Services';
      case 'venue':
      case 'venues':
        return 'Venue Options';
      default:
        return 'Items';
    }
  };

  // Separate regular items and combo items
  // Only consider items as combos if they have comboCategories with actual items
  const regularItems = bookableItems.filter(item =>
    !item.comboCategories ||
    !Array.isArray(item.comboCategories) ||
    item.comboCategories.length === 0
  );
  const comboItems = bookableItems.filter(item =>
    item.comboCategories &&
    Array.isArray(item.comboCategories) &&
    item.comboCategories.length > 0
  );

  return (
    <Collapsible open={isExpanded}>
      <CollapsibleContent className="mt-4">
        <div className="border-t pt-4 space-y-6">
          {/* Regular Menu Items */}
          {regularItems.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-700">
                Available {getSectionTitle(serviceType)}
              </h4>
              <ServiceItemsList
                serviceType={serviceType}
                items={regularItems}
                selectedItems={selectedItems}
                onItemQuantityChange={onItemQuantityChange}
                onComboSelection={onComboSelection}
              />
            </div>
          )}

          {/* Combo Items */}
          {comboItems.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 text-gray-700">
                Available Combo Packages
              </h4>
              <ComboItemsList
                items={comboItems}
                selectedItems={selectedItems}
                onItemQuantityChange={onItemQuantityChange}
                onComboSelection={onComboSelection}
              />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

ItemsSection.displayName = 'ItemsSection';

export default ItemsSection;
