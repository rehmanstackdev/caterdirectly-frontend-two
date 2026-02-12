
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Server, LucideIcon } from "lucide-react";

export interface SystemPerformanceItem {
  title: string;
  value: string;
  status: "healthy" | "warning" | "error";
  icon: LucideIcon;
}

interface SystemPerformanceCardProps {
  items: SystemPerformanceItem[];
}

const SystemPerformanceCard = ({ items }: SystemPerformanceCardProps) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="mr-2 h-5 w-5" />
          System Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${
                stat.status === 'healthy' ? 'bg-green-100 text-green-600' : 
                stat.status === 'warning' ? 'bg-amber-100 text-amber-600' : 
                'bg-red-100 text-red-600'
              }`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="ml-3 text-sm font-medium">{stat.title}</span>
            </div>
            <span className={`text-sm font-semibold ${
              stat.status === 'healthy' ? 'text-green-600' : 
              stat.status === 'warning' ? 'text-amber-600' : 
              'text-red-600'
            }`}>{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SystemPerformanceCard;
