

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, TrendingUp, DollarSign } from "lucide-react";

const ChartsSection = () => {
  console.log("ChartsSection: Rendering charts section");
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            User Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>User growth chart will appear here</p>
            <p className="text-xs mt-2">Data visualization to be implemented</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Revenue Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>Revenue trends chart will appear here</p>
            <p className="text-xs mt-2">Data visualization to be implemented</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
