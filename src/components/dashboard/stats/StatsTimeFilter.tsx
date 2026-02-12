

import { Clock, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatsTimeFilterProps {
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  timeFilters: string[];
}

const StatsTimeFilter = ({
  timeFilter,
  setTimeFilter,
  timeFilters
}: StatsTimeFilterProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex bg-[#F07712] items-center gap-2 rounded-[5px] px-3 sm:px-[22px] py-2 sm:py-3 cursor-pointer min-w-[120px] max-w-full">
          <Clock className="h-4 w-4 text-white flex-shrink-0 align-middle" />
          <span className="text-sm font-semibold text-white truncate leading-none">{timeFilter}</span>
          <ChevronDown className="h-4 w-4 text-white flex-shrink-0 align-middle" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border rounded-md shadow-lg z-50 min-w-[140px]">
        {timeFilters.map((filter) => (
          <DropdownMenuItem 
            key={filter} 
            onClick={() => setTimeFilter(filter)}
            className="cursor-pointer hover:bg-gray-100 px-4 py-2 text-sm"
          >
            {filter}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatsTimeFilter;
