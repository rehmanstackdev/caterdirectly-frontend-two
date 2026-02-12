
import React from "react";
import SystemPerformanceCard from "./system-performance/SystemPerformanceCard";
import RecentActivitiesTable from "./recent-activities/RecentActivitiesTable";
import { performanceStatsMockData, recentActivitiesMockData } from "./data/mock-dashboard-data";

const PerformanceSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SystemPerformanceCard items={performanceStatsMockData} />
      <RecentActivitiesTable activities={recentActivitiesMockData} />
    </div>
  );
};

export default PerformanceSection;
