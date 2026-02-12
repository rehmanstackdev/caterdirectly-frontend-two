import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  clients: number;
  proposals?: number;
}

const RevenueMetrics = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProposals, setTotalProposals] = useState(0);
  const [proposalRevenue, setProposalRevenue] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      // Fetch real orders data
      const { data: orders, error } = await supabase
        .from('orders')
        .select('price, created_at, status')
        .eq('payment_status', 'paid');

      if (error) throw error;

      // Fetch invoices data
      const { data: proposals, error: proposalsError } = await supabase
        .from('invoices')
        .select('total, created_at, status');

      if (proposalsError) throw proposalsError;

      // Process the data for charts
      const monthlyData: { [key: string]: { revenue: number; orders: number; clients: Set<string>; proposals: number } } = {};
      let revenue = 0;
      let orderCount = 0;
      let proposalCount = 0;
      let proposalRevValue = 0;

      orders?.forEach(order => {
        if (order.price) {
          revenue += parseFloat(order.price.toString());
          orderCount++;
        }

        const date = new Date(order.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, orders: 0, clients: new Set(), proposals: 0 };
        }
        
        if (order.price) {
          monthlyData[monthKey].revenue += parseFloat(order.price.toString());
        }
        monthlyData[monthKey].orders++;
      });

      // Process proposals data
      proposals?.forEach(proposal => {
        proposalCount++;
        if (proposal.total && (proposal.status === 'paid' || proposal.status === 'accepted')) {
          proposalRevValue += parseFloat(proposal.total.toString());
        }

        const date = new Date(proposal.created_at);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, orders: 0, clients: new Set(), proposals: 0 };
        }
        
        monthlyData[monthKey].proposals++;
      });

      // Convert to chart format
      const chartData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders,
        clients: data.clients.size,
        proposals: data.proposals
      }));

      setRevenueData(chartData.slice(-6)); // Last 6 months
      setTotalRevenue(revenue + proposalRevValue);
      setTotalOrders(orderCount);
      setTotalProposals(proposalCount);
      setProposalRevenue(proposalRevValue);
      
      // Calculate conversion rate from proposals to paid
      const conversionRate = proposalCount > 0 ? ((proposalRevValue > 0 ? proposals?.filter(p => p.status === 'paid').length || 0 : 0) / proposalCount) * 100 : 0;
      setConversionRate(conversionRate);

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Metrics */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
              </div>
              <p className="text-xs text-green-600 mt-2">+15.3% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
                </div>
                <Users className="h-12 w-12 text-blue-600 opacity-20" />
              </div>
              <p className="text-xs text-blue-600 mt-2">+8.1% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Proposal Conversion</p>
                  <p className="text-3xl font-bold text-purple-600">{conversionRate.toFixed(1)}%</p>
                </div>
                <Target className="h-12 w-12 text-purple-600 opacity-20" />
              </div>
              <p className="text-xs text-purple-600 mt-2">Proposals → Paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                  <p className="text-3xl font-bold text-[#F07712]">{totalProposals}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-[#F07712] opacity-20" />
              </div>
              <p className="text-xs text-[#F07712] mt-2">{formatCurrency(proposalRevenue)} value</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueMetrics;