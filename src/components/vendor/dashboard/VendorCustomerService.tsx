
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ServiceTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  created_at: string;
  admin_response?: string;
  responded_at?: string;
}

const VendorCustomerService: React.FC = () => {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;

      try {
        // Get vendor ID for current user
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!vendorData) {
          setLoading(false);
          return;
        }

        // Fetch support tickets for this vendor
        const { data: ticketsData } = await supabase
          .from('vendor_support_tickets')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .order('created_at', { ascending: false });

        const mappedTickets = (ticketsData || []).map(ticket => ({
          id: ticket.id,
          subject: ticket.subject,
          message: ticket.message,
          category: ticket.category,
          priority: ticket.priority as 'high' | 'medium' | 'low' | 'urgent',
          status: ticket.status as 'open' | 'pending' | 'resolved' | 'closed',
          created_at: ticket.created_at,
          admin_response: ticket.admin_response,
          responded_at: ticket.responded_at
        }));

        setTickets(mappedTickets);
      } catch (error) {
        console.error('Error fetching support tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Service Queue
          </div>
          <Badge variant="outline">{tickets.length} open</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading support tickets...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(ticket.status)}
                    <h4 className="font-medium">{ticket.subject}</h4>
                    <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                      {ticket.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{ticket.message}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                    <span>Category: {ticket.category}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Respond
                </Button>
              </div>
            ))}
            
            {tickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No customer service requests</p>
                <p className="text-sm">Great job staying on top of client needs!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorCustomerService;
