

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, LucideIcon } from "lucide-react";

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
}

const ChartCard = ({ title, icon: Icon }: ChartCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <BarChart2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p>Chart visualization will appear here</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
