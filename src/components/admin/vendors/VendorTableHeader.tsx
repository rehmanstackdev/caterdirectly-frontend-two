

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchBar";

interface VendorTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  createNewVendor: () => void;
}

export const VendorTableHeader = ({
  searchQuery,
  setSearchQuery,
  createNewVendor,
}: VendorTableHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <Button onClick={createNewVendor} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Create Vendor
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
    </>
  );
};
