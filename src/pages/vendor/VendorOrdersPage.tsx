import { useState, useEffect } from 'react';
import VendorDashboard from '@/components/vendor/dashboard/VendorDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VendorActionButtons from '@/components/vendor/action-buttons/VendorActionButtons';
import { useToast } from '@/hooks/use-toast';
import VendorOrdersService from '@/services/api/vendor/orders.Service';
import VendorOrdersTable from '@/components/vendor/orders/VendorOrdersTable';

type VendorStatus = 'pending' | 'accepted' | 'declined';

function VendorOrdersPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (status?: VendorStatus) => {
    const userData = localStorage.getItem('user_data');
    if (!userData) return;
    
    try {
      setLoading(true);
      const parsedUser = JSON.parse(userData);
      const vendorId = parsedUser.vendorId || parsedUser.vendor?.id;
      
      if (!vendorId) {
        toast({
          title: "Error",
          description: "Vendor ID not found",
          variant: "destructive",
        });
        return;
      }
      
      const response = await VendorOrdersService.getVendorOrders(vendorId, status);
      let filteredOrders = response.data || [];
      
      // Additional filtering for completed orders (orders with payment)
      if (activeTab === 'completed') {
        filteredOrders = filteredOrders.filter((order: any) => 
          order.orders && order.orders.length > 0 && order.status === 'paid'
        );
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (activeTab === 'pending') {
      fetchOrders('pending');
    } else if (activeTab === 'canceled') {
      fetchOrders('declined');
    } else if (activeTab === 'completed') {
      fetchOrders('accepted'); // Get accepted orders, then filter for completed ones
    }
  }, [activeTab]);

  return (
    <VendorDashboard activeTab="orders">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders & Bookings</h1>
        <VendorActionButtons />
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Accepted</TabsTrigger>
          <TabsTrigger value="canceled">Declined</TabsTrigger>
        </TabsList>
        
        {['pending', 'completed', 'canceled'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <Card>
              <CardContent className="p-0">
                <VendorOrdersTable
                  orders={orders}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </VendorDashboard>
  );
};

export default VendorOrdersPage;
