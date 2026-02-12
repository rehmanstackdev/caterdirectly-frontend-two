
import { useState } from "react";
import { ChevronDown, ChevronUp, ShoppingCart, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMenuItemPrice } from "@/hooks/events/utils/menu-utils";
import { MenuItem } from "@/types/service-types";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ComboSelectionForm from "./ComboSelectionForm";
import { ComboSelections } from "@/types/order";

interface MenuItemsProps {
  menuItems: MenuItem[];
  showMenuItems: boolean;
  toggleMenuItems: (e: React.MouseEvent) => void;
  handleBookMenuItem: (e: React.MouseEvent, menuItem: MenuItem, comboSelections?: ComboSelections) => void;
  handleViewDetails: () => void;
}

const MenuItems = ({
  menuItems,
  showMenuItems,
  toggleMenuItems,
  handleBookMenuItem,
  handleViewDetails
}: MenuItemsProps) => {
  const [comboDialogOpen, setComboDialogOpen] = useState(false);
  const [selectedComboItem, setSelectedComboItem] = useState<MenuItem | null>(null);

  if (!menuItems.length) return null;
  
  const handleItemClick = (e: React.MouseEvent, item: MenuItem) => {
    if (item.isCombo) {
      e.preventDefault();
      setSelectedComboItem(item);
      setComboDialogOpen(true);
    } else {
      handleBookMenuItem(e, item);
    }
  };

  const handleComboSelectionComplete = (selections: ComboSelections) => {
    if (selectedComboItem) {
      handleBookMenuItem(new MouseEvent('click') as any, selectedComboItem, selections);
      setComboDialogOpen(false);
      setSelectedComboItem(null);
    }
  };
  
  return (
    <div className="mb-3">
      <button 
        onClick={toggleMenuItems}
        className="w-full flex items-center justify-between py-1 px-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium">Menu Items</span>
        {showMenuItems ? 
          <ChevronUp className="h-4 w-4 text-gray-500" /> : 
          <ChevronDown className="h-4 w-4 text-gray-500" />
        }
      </button>
      
      {showMenuItems && (
        <div className="mt-2 space-y-2 overflow-x-hidden">
          {menuItems.slice(0, 4).map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-gray-50 rounded-md">
              <div className="min-w-0 mb-1 sm:mb-0">
                <div className="flex items-center">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  {item.isCombo && (
                    <Badge className="ml-1 text-xs bg-blue-100 text-blue-800 border-blue-200">
                      <ListFilter className="h-3 w-3 mr-1" />
                      Combo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{item.description || ''}</p>
                {item.isCombo && item.comboCategories && item.comboCategories.length > 0 && (
                  <div className="text-xs text-blue-600 mt-0.5">
                    Customizable with {item.comboCategories.length} selection categories
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 mt-1 sm:mt-0">
                <span className="text-sm font-medium text-[#F07712]">
                  {formatMenuItemPrice(item.price)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 flex-shrink-0"
                  onClick={(e) => handleItemClick(e, item)}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {menuItems.length > 4 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewDetails}
              className="w-full text-xs"
            >
              View {menuItems.length - 4} more items
            </Button>
          )}
        </div>
      )}

      {/* Combo Selection Dialog */}
      <Dialog open={comboDialogOpen} onOpenChange={setComboDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedComboItem && (
            <ComboSelectionForm
              comboItem={selectedComboItem}
              onAddToOrder={handleComboSelectionComplete}
              onCancel={() => setComboDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuItems;
