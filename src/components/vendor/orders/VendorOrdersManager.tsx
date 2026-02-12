
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Eye, MessageSquare, Phone, Search, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Order {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  date: string;
  location: string;
  guests: number;
  created_at: string;
  last_contact?: string;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
}

const VendorOrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!vendor) return;

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = ordersData?.map(order => ({
        id: order.id,
        title: order.title,
        client_name: 'Client Name', // Would come from profiles
        client_email: 'client@example.com', // Would come from profiles
        status: order.status as any,
        price: order.price || 0,
        date: order.date || 'TBD',
        location: order.location || 'Location TBD',
        guests: order.guests || 0,
        created_at: order.created_at,
        payment_status: order.payment_status as any || 'pending'
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ordersByStatus = {
    pending: filteredOrders.filter(o => o.status === 'pending'),
    confirmed: filteredOrders.filter(o => o.status === 'confirmed'),
    in_progress: filteredOrders.filter(o => o.status === 'in_progress'),
    completed: filteredOrders.filter(o => o.status === 'completed'),
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{order.title}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <User className="h-4 w-4" />
            {order.client_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace('_', ' ')}
          </Badge>
          <Badge className={getPaymentStatusColor(order.payment_status)}>
            {order.payment_status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {order.date}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          ${order.price.toLocaleString()}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-1" />
            Call
          </Button>
        </div>
        
        <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Object.entries(ordersByStatus).map(([status, statusOrders]) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium capitalize">
                    {status.replace('_', ' ')} ({statusOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {statusOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                  {statusOrders.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No {status.replace('_', ' ')} orders
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No orders found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorOrdersManager;
