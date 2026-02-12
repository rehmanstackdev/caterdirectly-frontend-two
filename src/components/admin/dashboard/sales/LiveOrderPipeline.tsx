
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, Calendar, MapPin } from 'lucide-react';

interface Order {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  eventType: string;
  venueName: string;
  venueAddress: string;
  createdAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

const LiveOrderPipeline = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      console.log('🚀 Fetching orders from:', `${API_URL}/events/active-orders`);
      console.log('🔑 Auth token:', token ? '✅ Present' : '❌ Missing');
      
      const response = await fetch(`${API_URL}/events/active-orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📦 Full API Response:', data);
      console.log('📋 Orders array:', data.data);
      console.log('🔢 Number of orders:', data.data?.length || 0);
      
      setOrders(data.data || []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Order Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Live Order Pipeline
          <Button variant="outline" size="sm">View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{order.title}</h4>
                  <Badge className="bg-green-100 text-green-800">
                    {order.eventType}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.startDateTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {order.venueAddress || order.venueName || 'Location TBD'}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  Created by: {order.createdBy.firstName} {order.createdBy.lastName}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found. Create your first proposal to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveOrderPipeline;
