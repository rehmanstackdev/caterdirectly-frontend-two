

import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass: string;
  actionLabel: string;
  actionLink?: () => void;
}

const StatCard = ({
  title,
  value,
  icon,
  iconBgClass,
  actionLabel,
  actionLink
}: StatCardProps) => {
  const handleActionClick = () => {
    if (actionLink) {
      actionLink();
    }
  };
  
  // Format the value to ensure single 0 for zero values
  const formattedValue = value === 0 || value === "0" ? "0" : value;
  
  return (
    <Card className="w-full h-[121px] p-0 bg-white shadow-[0px_4px_14px_#F1F1F1] rounded-lg hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col h-full p-3">
        <div className="flex flex-col h-[79px]">
          <div className="flex justify-between items-start w-full mb-2.5">
            <span className="font-['Poppins'] text-sm sm:text-base font-normal text-black">{title}</span>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${iconBgClass} transition-transform duration-300 hover:scale-110`}>
              {icon}
            </div>
          </div>
          <span className="font-['Poppins'] text-xl sm:text-[26px] font-medium text-black text-left">{formattedValue}</span>
        </div>
        <div className="relative mt-auto">
          <div 
            onClick={handleActionClick}
            className="group inline-flex items-center cursor-pointer"
          >
            <span className="font-['Poppins'] text-xs text-[#F07712] group-hover:text-[#ff8a2b] transition-all duration-300">
              {actionLabel}
            </span>
            <ArrowRight className="ml-1.5 w-[15px] h-[15px] text-[#F07712] group-hover:text-[#ff8a2b] group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
