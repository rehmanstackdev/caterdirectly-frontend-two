
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddServiceButtonProps {
  onAddService: () => void;
  hasServices: boolean;
}

const AddServiceButton = ({ 
  onAddService, 
  hasServices 
}: AddServiceButtonProps) => {
  if (hasServices) {
    // Show standalone button when services are selected
    return (
      <div className="mb-4 sm:mb-6 w-full overflow-x-hidden">
        <Button 
          variant="outline" 
          className="w-full max-w-full border-dashed border-gray-300 py-4 sm:py-6 text-sm sm:text-base hover:bg-gray-50 min-h-[44px] overflow-hidden"
          onClick={onAddService}
        >
          <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate max-w-full">Add Additional Service</span>
        </Button>
      </div>
    );
  }

  // Show initial button in card when no services are selected
  return (
    <div className="bg-white rounded-xl p-3 sm:p-5 shadow-sm border border-gray-100 mt-4 sm:mt-6 w-full overflow-x-hidden">
      <Button 
        variant="outline" 
        className="w-full max-w-full border-dashed border-gray-300 py-4 sm:py-6 text-sm sm:text-base min-h-[44px] overflow-hidden"
        onClick={onAddService}
      >
        <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="truncate max-w-full">Add Additional Service</span>
      </Button>
    </div>
  );
};

export default AddServiceButton;
