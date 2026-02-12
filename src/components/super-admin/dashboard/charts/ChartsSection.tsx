
import React from "react";
import ChartCard from "./ChartCard";
import { TrendingUp, DollarSign } from "lucide-react";

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChartCard title="User Growth" icon={TrendingUp} />
      <ChartCard title="Revenue Trends" icon={DollarSign} />
    </div>
  );
};

export default ChartsSection;
