
import { Button } from "@/components/ui/button";
import ServiceImage from "../shared/ServiceImage";

interface SelectedVendorCardProps {
  vendorName?: string;
  vendorImage?: string;
  vendorPrice?: string;
  onChangeVendor: () => void;
}

const SelectedVendorCard = ({
  vendorName,
  vendorImage,
  vendorPrice,
  onChangeVendor
}: SelectedVendorCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            {vendorImage ? (
              <ServiceImage 
                src={vendorImage} 
                alt={vendorName || "Service"} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{vendorName || "Selected Service"}</h3>
            {vendorPrice && <p className="text-[#F07712]">{vendorPrice}</p>}
          </div>
        </div>
        <Button 
          onClick={onChangeVendor}
          variant="outline"
          className="border-[#F07712] text-[#F07712] hover:bg-[#F07712]/10"
        >
          Change Service
        </Button>
      </div>
    </div>
  );
};

export default SelectedVendorCard;
