
import React from "react";

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</div>
    </div>
  );
};

export default DashboardHeader;
