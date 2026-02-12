

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useRecentActivities } from "@/hooks/use-admin-dashboard";

const RealRecentActivities = () => {
  const { data: activities, isLoading, error } = useRecentActivities();

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 border-b">
          <h2 className="font-medium text-lg">Recent Actions</h2>
        </div>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-4 border-b">
          <h2 className="font-medium text-lg">Recent Actions</h2>
        </div>
        <CardContent>
          <div className="text-red-500 py-4">Error loading recent activities</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending_approval':
        return 'Needs Approval';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      case 'resolved':
        return 'Resolved';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card>
      <div className="p-4 border-b">
        <h2 className="font-medium text-lg">Recent Actions</h2>
      </div>
      <CardContent>
        <div className="space-y-4">
          {activities?.length ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium">{activity.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{activity.type}</span>
                    <span>•</span>
                    <span>{activity.date}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                    {getStatusLabel(activity.status)}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 ml-2" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              No recent activities found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealRecentActivities;
