import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HostTableHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  createNewHost: () => void;
}

export const HostTableHeader = ({
  searchQuery,
  setSearchQuery,
  createNewHost,
}: HostTableHeaderProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Host Management</h1>
        <Button onClick={createNewHost} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Create Host
        </Button>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search hosts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
    </>
  );
};
