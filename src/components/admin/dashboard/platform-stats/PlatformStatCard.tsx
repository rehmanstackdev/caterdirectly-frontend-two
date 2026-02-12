

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface PlatformStatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
}

const PlatformStatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}: PlatformStatCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-sm text-green-600 mt-1">{change} from last month</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformStatCard;
