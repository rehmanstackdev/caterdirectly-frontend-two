
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Package, Users, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  activeServices: number;
  pendingPayouts: number;
  avgResponseTime: string;
}

interface VendorDashboardLayoutProps {
  metrics: DashboardMetrics;
  recentOrders: any[];
  upcomingEvents: any[];
}

const VendorDashboardLayout: React.FC<VendorDashboardLayoutProps> = ({
  metrics,
  recentOrders,
  upcomingEvents
}) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            {metrics.pendingOrders > 0 && (
              <p className="text-xs text-muted-foreground">
                {metrics.pendingOrders} pending approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue.toLocaleString()}</div>
            {metrics.pendingPayouts > 0 && (
              <p className="text-xs text-muted-foreground">
                ${metrics.pendingPayouts.toLocaleString()} pending payout
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeServices}</div>
            <p className="text-xs text-muted-foreground">
              Avg response: {metrics.avgResponseTime}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/vendor/services/create">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Package className="h-5 w-5" />
                <span className="text-sm">Add Service</span>
              </Button>
            </Link>
            
            <Link to="/vendor/new-proposal">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">Create Proposal</span>
              </Button>
            </Link>
            
            <Link to="/vendor/calendar">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Manage Calendar</span>
              </Button>
            </Link>
            
            <Link to="/vendor/settings">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Account Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.slice(0, 5).map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{order.title}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === 'pending' ? 'outline' : 'default'}>
                        {order.status}
                      </Badge>
                      <p className="text-sm font-medium">${order.price}</p>
                    </div>
                  </div>
                ))}
                <Link to="/vendor/orders">
                  <Button variant="link" className="w-full">View All Orders</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent orders</p>
                <Link to="/vendor/services">
                  <Button variant="link">Manage Your Services</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date} at {event.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{event.location}</p>
                      <Badge variant="secondary">{event.guests} guests</Badge>
                    </div>
                  </div>
                ))}
                <Link to="/vendor/calendar">
                  <Button variant="link" className="w-full">View Full Calendar</Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardLayout;
