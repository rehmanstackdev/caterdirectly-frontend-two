

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Server, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useSystemMetrics } from "@/hooks/use-admin-dashboard";

const RealSystemPerformance = () => {
  const metrics = useSystemMetrics();

  const items = [
    {
      title: "System Uptime",
      value: metrics.systemUptime,
      status: "healthy" as const,
      icon: Server
    },
    {
      title: "API Response",
      value: metrics.apiResponse,
      status: "healthy" as const,
      icon: Activity
    },
    {
      title: "Error Rate",
      value: metrics.errorRate,
      status: "healthy" as const,
      icon: AlertTriangle
    },
    {
      title: "Payment Success",
      value: metrics.paymentSuccess,
      status: "healthy" as const,
      icon: CheckCircle
    }
  ];

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

export default RealSystemPerformance;
