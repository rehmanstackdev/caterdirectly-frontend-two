import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  User, 
  Clock,
  FileText,
  Phone,
  Building,
  MapPin,
  Star,
  ShoppingCart,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VendorClient {
  id: string;
  name: string;
  company?: string;
  email: string; // Hidden from vendor UI
  phone?: string; // Hidden from vendor UI
  totalOrders: number;
  totalRevenue: number;
  lastOrderDate: string;
  averageOrderValue: number;
  status: 'active' | 'inactive' | 'prospect';
  notes: string;
  tags: string[];
  createdAt: string;
  location?: string;
  preferredServices: string[];
  rating?: number;
}

interface ClientNote {
  id: string;
  clientId: string;
  note: string;
  createdAt: string;
  createdBy: string;
}

const VendorClientManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState<VendorClient[]>([]);
  const [clientNotes, setClientNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<VendorClient | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchVendorClients();
  }, [user]);

  const fetchVendorClients = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get vendor's ID first
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (vendorError) throw vendorError;

      // Fetch clients from orders where this vendor was involved
      // Note: We only show clients they've actually worked with, no contact info
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          host_id,
          title,
          price,
          created_at
        `)
        .eq('vendor_id', vendorData.id)
        .eq('status', 'completed');

      if (ordersError) throw ordersError;

      // Get unique host profiles for these orders
      const hostIds = [...new Set(ordersData?.map(order => order.host_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, user_type')
        .in('id', hostIds);

      if (profilesError) throw profilesError;

      // Create a map of host profiles
      const profileMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Process orders to create client data (aggregated)
      const clientMap = new Map<string, VendorClient>();
      
      ordersData?.forEach(order => {
        const profile = profileMap.get(order.host_id);
        if (!profile) return;
        
        const clientId = order.host_id;
        const clientName = `${profile.first_name} ${profile.last_name}`;
        
        if (clientMap.has(clientId)) {
          const existing = clientMap.get(clientId)!;
          existing.totalOrders += 1;
          existing.totalRevenue += order.price || 0;
          existing.averageOrderValue = existing.totalRevenue / existing.totalOrders;
          
          if (new Date(order.created_at) > new Date(existing.lastOrderDate)) {
            existing.lastOrderDate = order.created_at;
          }
        } else {
          clientMap.set(clientId, {
            id: clientId,
            name: clientName,
            company: profile.user_type === 'business' ? 'Business Account' : undefined,
            email: '', // Hidden for security
            phone: '', // Hidden for security
            totalOrders: 1,
            totalRevenue: order.price || 0,
            lastOrderDate: order.created_at,
            averageOrderValue: order.price || 0,
            status: 'active',
            notes: '',
            tags: [],
            createdAt: order.created_at,
            preferredServices: []
          });
        }
      });

      setClients(Array.from(clientMap.values()));
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load client data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addClientNote = async (clientId: string) => {
    if (!newNote.trim() || !user) return;

    try {
      const note: ClientNote = {
        id: Date.now().toString(),
        clientId,
        note: newNote,
        createdAt: new Date().toISOString(),
        createdBy: user.id
      };

      setClientNotes([...clientNotes, note]);
      setNewNote('');
      
      toast({
        title: "Note added",
        description: "Client note has been saved successfully.",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note.",
        variant: "destructive",
      });
    }
  };

  const getClientNotes = (clientId: string) => {
    return clientNotes.filter(note => note.clientId === clientId);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ClientCard = ({ client }: { client: VendorClient }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => setSelectedClient(client)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{client.name}</h3>
            {client.company && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Building className="h-3 w-3" />
                {client.company}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(client.status)}>
            {client.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-gray-400" />
            <span>{client.totalOrders} orders</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>${client.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{format(new Date(client.lastOrderDate), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span>Avg: ${client.averageOrderValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Open messaging interface
            }}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <span className="text-xs text-gray-500">
            Client since {format(new Date(client.createdAt), 'MMM yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F07712] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Management</h2>
          <p className="text-gray-600">Manage relationships with your clients</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
              <User className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${clients.reduce((sum, c) => sum + c.totalRevenue, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">
                  ${Math.round(clients.reduce((sum, c) => sum + c.averageOrderValue, 0) / clients.length || 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients by name or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No clients found</p>
            <p className="text-sm text-gray-400">
              Complete your first order to start building your client base
            </p>
          </CardContent>
        </Card>
      )}

      {/* Client Detail Modal/Sidebar would go here */}
      {selectedClient && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Client Details: {selectedClient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="history">Order History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Total Orders</p>
                    <p className="text-2xl font-bold">{selectedClient.totalOrders}</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">${selectedClient.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note about this client..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button onClick={() => addClientNote(selectedClient.id)}>
                    Add Note
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {getClientNotes(selectedClient.id).map(note => (
                    <Card key={note.id}>
                      <CardContent className="p-3">
                        <p className="text-sm">{note.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(note.createdAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={() => setSelectedClient(null)}>
                Close
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorClientManager;