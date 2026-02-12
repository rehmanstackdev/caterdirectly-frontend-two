
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight, DollarSign, Calendar, MapPin, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SalesLead {
  id: string;
  title: string;
  client_name: string;
  potential_value: number;
  event_date: string;
  status: string;
  location: string;
  guests: number;
  created_at: string;
}

const VendorSalesPipeline: React.FC = () => {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesLeads();
  }, []);

  const fetchSalesLeads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!vendor) return;

      // Fetch ONLY paid, confirmed orders (vendors don't see proposals)
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('vendor_id', vendor.id)
        .eq('payment_status', 'paid')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedLeads = orders?.map(order => ({
        id: order.id,
        title: order.title,
        client_name: 'Client Name', // Would come from profiles table
        potential_value: order.price || 0,
        event_date: order.date || 'TBD',
        status: order.status,
        location: order.location || 'Location TBD',
        guests: order.guests || 0,
        created_at: order.created_at
      })) || [];

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching sales leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
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
          Sales Pipeline
          <Button variant="outline" size="sm">View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{lead.title}</h4>
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(lead.potential_value)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {lead.event_date}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {lead.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {lead.guests} guests
                  </div>
                </div>
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
          
          {leads.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No confirmed orders yet. Orders will appear here once clients pay.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorSalesPipeline;
