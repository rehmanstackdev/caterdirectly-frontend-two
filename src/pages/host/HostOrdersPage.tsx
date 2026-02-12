
import { useState } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/hooks/use-orders';
import { useDraftOrders } from '@/hooks/use-draft-orders';
import OrderList from '@/components/dashboard/stats/OrderList';
import DraftOrderCard from '@/components/dashboard/DraftOrderCard';
import { Star, Download, RefreshCw } from 'lucide-react';
import { OrderStatus } from '@/types/order-types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function HostOrdersPage() {
  const { allOrders, activeTab, setActiveTab, submitReview, isLoading, error } = useOrders();
  const { deleteDraft } = useDraftOrders();
  const [timeFilter, setTimeFilter] = useState<string>("Last 30 Days");
  const navigate = useNavigate();
  
  // Debug logging
  console.log('HostOrdersPage - Orders data:', { allOrders, isLoading, error });
  
  const timeFilters = [
    "Last 7 Days",
    "Last 30 Days",
    "Last 3 Months",
    "Last 6 Months",
    "Last Year"
  ];
  
  // Filter orders based on status
  const activeOrders = allOrders.filter(order => ['active', 'pending', 'confirmed'].includes(order.status as any));
  const completedOrders = allOrders.filter(order => ['ended', 'completed'].includes(order.status as any));
  const draftOrders = allOrders.filter(order => order.status === 'draft');

  // Transform orders into the format expected by the OrderList component
  const formatOrders = (orders: any[]) => {
    return orders.map((order: any) => {
      const statusRaw = (order.status || '').toString().toLowerCase();
      const payment = (order.payment_status || '').toString().toLowerCase();
      const primary = statusRaw === 'ended' || statusRaw === 'completed'
        ? 'Delivered'
        : statusRaw === 'draft'
          ? 'Draft'
          : statusRaw === 'pending'
            ? 'Pending'
            : statusRaw === 'cancelled' || statusRaw === 'canceled'
              ? 'Cancelled'
              : 'Active';
      const paymentLabel = payment === 'paid' ? 'Confirmed' : payment === 'pending' ? 'Pending Payment' : undefined;
      const statusLabel = paymentLabel && primary !== 'Draft' ? `${primary} • ${paymentLabel}` : primary;

      return {
        id: order.id,
        name: order.title,
        image: order.image,
        date: order.date,
        orderNumber: `Order #${String(order.id).slice(0, 8).toUpperCase()}`,
        amount: `$${(order.price || 0).toFixed(2)}`,
        status: statusLabel,
        rating: order.review ? order.review.rating : 0,
        actions: primary === 'Delivered' ? 'Download Receipt • Reorder' : 'View Details',
        additionalTip: order.additionalTip || null,
      };
    });
  };

  const handleDeleteDraft = async (draftId: string) => {
    const success = await deleteDraft(draftId);
    if (success) {
      toast.success('Draft deleted successfully');
    }
  };
  
  // Handle tab change with type casting to ensure correct type
  const handleTabChange = (value: string) => {
    // Cast the string value to OrderStatus type since we know it will be one of the valid values
    setActiveTab(value as OrderStatus);
  };
  
  const handleSelectOrder = (orderId: string) => {
    navigate(`/host/orders/${orderId}`);
  };
  
  if (isLoading) {
    return (
      <Dashboard userRole="event-host" activeTab="orders">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading orders...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard userRole="event-host" activeTab="orders">
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-red-600">
            <p>Error loading orders: {error.message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard userRole="event-host" activeTab="orders">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-['Poppins']">Order History</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Orders
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="ended">Completed Orders</TabsTrigger>
          <TabsTrigger value="draft">Draft Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeOrders.length > 0 ? (
            <OrderList orders={formatOrders(activeOrders)} onSelect={handleSelectOrder} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <p>You have no active orders at the moment.</p>
                  <p className="mt-2">Orders that are currently in progress will appear here.</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="ended">
          {completedOrders.length > 0 ? (
            <OrderList orders={formatOrders(completedOrders)} onSelect={handleSelectOrder} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <p>You have no completed orders yet.</p>
                  <p className="mt-2">Orders that have been delivered will appear here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="draft">
          {draftOrders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {draftOrders.map((order) => (
                <DraftOrderCard 
                  key={order.id} 
                  order={order} 
                  onDelete={handleDeleteDraft}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <p>You have no draft orders.</p>
                  <p className="mt-2">Saved but not submitted orders will appear here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}

export default HostOrdersPage;
