
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  status: string;
}

interface RecentActivitiesTableProps {
  activities: RecentActivity[];
}

const RecentActivitiesTable = ({ 
  activities 
}: RecentActivitiesTableProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>User/Entity</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">{activity.action}</TableCell>
                <TableCell>{activity.user}</TableCell>
                <TableCell>{activity.timestamp}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                    activity.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                    activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    activity.status === 'requires_attention' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {activity.status.replace('_', ' ')}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesTable;
