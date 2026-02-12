
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlusCircle, FileText, Loader2 } from "lucide-react";

interface BookingActionsProps {
  isGroupOrder: boolean;
  onSubmit: (e: FormEvent) => void;
  isInvoiceMode?: boolean;
  isLoading?: boolean;
}

function BookingActions({ 
  isGroupOrder, 
  onSubmit,
  isInvoiceMode = false,
  isLoading = false
}: BookingActionsProps) {
  const navigate = useNavigate();

  const getButtonText = () => {
    if (isLoading) {
      if (isInvoiceMode) return "Creating Invoice...";
      if (isGroupOrder) return "Processing...";
      return "Booking...";
    }
    if (isInvoiceMode) return "Create Invoice";
    if (isGroupOrder) return "Continue to Group Setup";
    return "Book Now";
  };

  const getButtonIcon = () => {
    if (isLoading) return <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 animate-spin" />;
    if (isInvoiceMode) return <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />;
    return <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />;
  };

  const getDescription = () => {
    if (isInvoiceMode) return "Generate a professional invoice for your client";
    if (isGroupOrder) return "Set up group order details in the next step";
    return "Complete your booking details to proceed";
  };

  const getButtonColor = () => {
    if (isInvoiceMode) return "bg-blue-600 hover:bg-blue-700";
    return "bg-[#F07712] hover:bg-[#F07712]/90";
  };

  return (
    <div className="bg-white border-t border-gray-200 pt-6 mt-8 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden">
        {/* Text content */}
        <div className="flex-1 text-center lg:text-left overflow-x-hidden min-w-0">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight break-words overflow-hidden">
            <span className="block truncate max-w-full">
              {isInvoiceMode ? "Create Client Invoice" : (isGroupOrder ? "Continue to Group Order" : "Make Reservation")}
            </span>
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mt-1 leading-relaxed break-words overflow-hidden">
            <span className="block truncate max-w-full">
              {getDescription()}
            </span>
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 w-full lg:w-auto lg:flex-shrink-0 overflow-x-hidden">
          <Button
            variant="outline"
            onClick={() => navigate('/marketplace')}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base font-medium border-gray-300 hover:bg-gray-50 order-2 sm:order-1 max-w-full overflow-hidden"
          >
            <span className="truncate max-w-full">Cancel</span>
          </Button>
          
          <Button 
            onClick={onSubmit}
            disabled={isLoading}
            className={`${getButtonColor()} w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 md:px-6 lg:px-8 text-sm sm:text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 order-1 sm:order-2 max-w-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getButtonIcon()}
            <span className="truncate max-w-full">
              {getButtonText()}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingActions;
