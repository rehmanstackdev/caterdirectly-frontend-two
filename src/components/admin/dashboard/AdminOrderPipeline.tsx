import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/glass-ui/GlassCard';
import { GlassBadge } from '@/components/glass-ui/GlassBadge';
import { GlassButton } from '@/components/glass-ui/GlassButton';
import { 
  Calendar,
  MapPin,
  DollarSign,
  User,
  ArrowRight,
  Clock,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const AdminOrderPipeline = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
      
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
      year: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <GlassCard variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Live Order Pipeline</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white/20 rounded-xl animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-brand" />
          <h3 className="text-lg font-semibold">Live Order Pipeline</h3>
        </div>
        <GlassButton 
          variant="secondary" 
          size="sm"
          onClick={() => navigate('/admin/orders')}
        >
          View All Orders
        </GlassButton>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div 
            key={order.id} 
            className="p-4 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 cursor-pointer transition-all"
            onClick={() => navigate(`/admin/orders?selectedOrder=${order.id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h4 className="font-semibold text-sm truncate">{order.title}</h4>
                  <GlassBadge variant="success" size="sm">
                    {order.eventType}
                  </GlassBadge>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.startDateTime)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{order.venueAddress || order.venueName || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(order.createdAt)}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {order.createdBy.firstName} {order.createdBy.lastName}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm">No recent orders found</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default AdminOrderPipeline;