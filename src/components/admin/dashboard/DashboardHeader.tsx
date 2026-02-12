

import { TrendingUp } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-[#F07712]" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">Sales & Customer Service Command Center</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-500">Last updated</div>
        <div className="text-sm font-medium">{new Date().toLocaleString()}</div>
      </div>
    </div>
  );
};

export default DashboardHeader;
