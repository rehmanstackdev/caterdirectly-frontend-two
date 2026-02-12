
import React from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";

interface VendorCardActionsProps {
  hasBookableItems: boolean;
  showChooseItems?: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  bookableItemsCount: number;
  onChangeService: () => void;
  canRemove: boolean;
  onRemoveService?: () => void;
  selectedItemsCount: number;
  showChangeService?: boolean;
}

const VendorCardActions = ({
  hasBookableItems,
  showChooseItems = true,
  isExpanded,
  setIsExpanded,
  bookableItemsCount,
  onChangeService,
  canRemove,
  onRemoveService,
  selectedItemsCount,
  showChangeService = true
}: VendorCardActionsProps) => {
  // Determine if the button should pulse (smooth animation to draw attention)
  const shouldPulse = hasBookableItems && selectedItemsCount === 0 && !isExpanded;
  
  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto overflow-x-hidden">
      <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto overflow-x-hidden">
        {hasBookableItems && showChooseItems && (
          <Collapsible open={isExpanded} onOpenChange={(open) => {
            // Guard: prevent redundant state sets that can trigger re-render loops
            if (open !== isExpanded) setIsExpanded(open);
          }}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                className={`border-gray-300 text-gray-700 hover:bg-gray-50 w-full xs:w-auto min-h-[40px] text-xs sm:text-sm px-2 sm:px-3 max-w-full overflow-hidden ${
                  shouldPulse ? 'animate-[orangePulse_2s_ease-in-out_infinite]' : ''
                }`}
              >
                <span className="mr-1 sm:mr-2 truncate flex-1 max-w-full">
                  {isExpanded ? 'Hide Items' : 'Choose Items'}
                </span>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        )}
        
        {showChangeService && (
          <Button
            onClick={onChangeService}
            variant="outline"
            size="sm"
            className="border-green-500 text-green-500 hover:bg-transparent hover:text-green-500 hover:border-green-500 w-full xs:w-auto min-h-[40px] px-2 sm:px-3 max-w-full overflow-hidden"
            aria-label="Edit service"
          >
            <Pencil className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          </Button>
        )}
        
        {canRemove && onRemoveService && (
          <Button 
            onClick={onRemoveService}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50 w-full xs:w-auto min-h-[40px] px-2 sm:px-3 max-w-full overflow-hidden"
            aria-label="Remove service"
          >
            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default VendorCardActions;
