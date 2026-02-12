
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare, AlertTriangle, User, ArrowRight } from 'lucide-react';

interface SupportTicket {
  id: string;
  client_name: string;
  client_type: 'individual' | 'corporate' | 'government' | 'other';
  issue_type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  order_id?: string;
  description: string;
}

const CustomerServiceQueue = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data since support tickets table doesn't exist yet
    // In next phase, we'll create the actual support ticket system
    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        client_name: 'Acme Corporation',
        client_type: 'corporate',
        issue_type: 'Order Issue',
        priority: 'urgent',
        status: 'open',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        order_id: 'ord-123',
        description: 'Catering vendor cancelled last minute for tomorrow\'s event'
      },
      {
        id: '2',
        client_name: 'Sarah Johnson',
        client_type: 'individual',
        issue_type: 'Payment Issue',
        priority: 'high',
        status: 'in_progress',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        description: 'Credit card charge failed for birthday party booking'
      },
      {
        id: '3',
        client_name: 'City of Austin',
        client_type: 'government',
        issue_type: 'Proposal Request',
        priority: 'medium',
        status: 'open',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        description: 'Need custom proposal for annual city council retreat'
      }
    ];

    setTickets(mockTickets);
    setLoading(false);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'corporate': return '🏢';
      case 'government': return '🏛️';
      case 'individual': return '👤';
      default: return '📋';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Service Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
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
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Service Queue
          </div>
          <Button variant="outline" size="sm">View All</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{getClientTypeIcon(ticket.client_type)}</span>
                  <h4 className="font-semibold">{ticket.client_name}</h4>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">{ticket.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(ticket.created_at)}
                  </div>
                  <span>Type: {ticket.issue_type}</span>
                  {ticket.order_id && <span>Order: {ticket.order_id}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {tickets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No support tickets in queue. Great job team! 🎉
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerServiceQueue;
