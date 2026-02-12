

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: "pending_approval" | "rejected" | "requires_attention" | "completed" | "open";
}

const RecentActivitiesTable = () => {
  // Mock data for recent activities
  const activities: RecentActivity[] = [
    {
      id: "1",
      action: "New vendor approval request",
      user: "Restaurant Milano",
      timestamp: "Just now",
      status: "pending_approval"
    },
    {
      id: "2",
      action: "Service update",
      user: "Luxury Catering Co.",
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      id: "3",
      action: "Content flagged for review",
      user: "Event Space XYZ",
      timestamp: "Yesterday",
      status: "requires_attention"
    },
    {
      id: "4",
      action: "License verification",
      user: "DJ Services Inc.",
      timestamp: "2 days ago",
      status: "rejected"
    }
  ];

  return (
    <Card className="h-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : activity.status === 'pending_approval'
                      ? 'bg-amber-100 text-amber-800'
                      : activity.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : activity.status === 'requires_attention'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-500">
            <Activity className="h-12 w-12 mb-4 text-gray-300" />
            <p>No recent activities</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesTable;
