
import React from "react";
import PlatformStatCard from "./PlatformStatCard";
import { platformStatsMockData } from "../data/mock-dashboard-data";

const PlatformStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {platformStatsMockData.map((stat, index) => (
        <PlatformStatCard 
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default PlatformStats;
