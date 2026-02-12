
import { useState, FC } from "react";
import SimpleAddressAutocomplete from "@/components/shared/SimpleAddressAutocomplete";
import { useNavigate } from "react-router-dom";
import { useLocation } from "@/hooks/use-location";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchBar = () => {
  const navigate = useNavigate();
  const { setAddress, enableLocationFiltering } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const handleAddressSelected = (address: string) => {
    console.log("SearchBar: Address selected", address);
    setSelectedAddress(address);
  };

  const handleSearch = () => {
    try {
      if (!selectedAddress || !selectedAddress.trim()) {
        toast({
          title: "Error",
          description: "Please enter a valid address",
          variant: "destructive",
        });
        return;
      }

      console.log("SearchBar: Searching with address:", selectedAddress);
      setIsSubmitting(true);

      // Save address and enable location filtering
      setAddress(selectedAddress);
      enableLocationFiltering();
      
      // Small timeout to ensure address is saved before navigation
      setTimeout(() => {
        console.log("SearchBar: Navigating to marketplace");
        navigate("/marketplace");
        setIsSubmitting(false);
      }, 300);
    } catch (error) {
      console.error("SearchBar: Error handling search:", error);
      setIsSubmitting(false);
      toast({
        title: "Error",
        description: "Failed to process your search",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full py-4 md:py-6">
      <div className="container mx-auto max-w-2xl px-2 sm:px-4 w-full">
        <div className="flex gap-2">
          <div className="flex-1">
            <SimpleAddressAutocomplete 
              onAddressSelected={handleAddressSelected}
              placeholder="Enter Your Delivery Address"
              className="h-12 text-base"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSubmitting || !selectedAddress.trim()}
            className="h-12 px-6 bg-[#F07712] hover:bg-[#F07712]/90 text-white"
            aria-label="Search for services"
            title="Search"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
