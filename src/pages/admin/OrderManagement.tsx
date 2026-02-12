import { useState, useEffect } from 'react';
import Dashboard from "@/components/dashboard/Dashboard";
import AdminOrdersTable from "@/components/admin/orders/AdminOrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Order } from '@/types/order-types';
import OrdersService from '@/services/api/admin/orders.Service';

function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  // console.log('📝 OrderManagement: Orders:', JSON.stringify(orders));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await OrdersService.getAllOrders();

        const responseData = response?.data;
        const ordersData = responseData?.data || response?.data || response;

        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const calculateMetrics = () => {
    const total = orders.length;
    const succeeded = orders.filter(o => o.paymentStatus === 'succeeded').length;
    const pending = orders.filter(o => o.paymentStatus === 'pending').length;
    const failed = orders.filter(o => o.paymentStatus === 'failed').length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'succeeded')
      .reduce((sum, o) => sum + (o.paymentDetails?.amount ? o.paymentDetails.amount / 100 : 0), 0);
    
    return {
      total,
      succeeded,
      pending,
      failed,
      totalRevenue,
      requiresAttention: pending + failed,
      paymentIssues: failed
    };
  };

  const metrics = calculateMetrics();
  const successRate = metrics.total > 0 
    ? Math.round((metrics.succeeded / metrics.total) * 100) 
    : 0;

  return (
    <Dashboard userRole="admin" activeTab="orders">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Orders & Bookings Management</h1>
          {loading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" />
              {metrics.total} Total Orders
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={`skeleton-metric-${index}`}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-yellow-500 mt-0.5" />
                    Requires Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {metrics.requiresAttention}
                  </div>
                  <p className="text-xs text-gray-500">Orders needing action</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{metrics.pending}</div>
                  <p className="text-xs text-gray-500">Awaiting payment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Succeeded
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics.succeeded}</div>
                  <p className="text-xs text-gray-500">Payment completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(metrics.totalRevenue)}
                  </div>
                  <p className="text-xs text-gray-500">Total processed</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`skeleton-stats-${index}`}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-16 mb-2" />
                  <Skeleton className="h-3 w-28" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Order Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Succeeded</span>
                    <Badge variant="outline">{metrics.succeeded}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge variant="outline">{metrics.failed}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Payment Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-600">{metrics.paymentIssues}</div>
                  <p className="text-xs text-gray-500">Failed or disputed payments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-green-600">{successRate}%</div>
                  <p className="text-xs text-gray-500">Orders completed successfully</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <AdminOrdersTable />
      </div>
    </Dashboard>
  );
}

export default OrderManagement;
