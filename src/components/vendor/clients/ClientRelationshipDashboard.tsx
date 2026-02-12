
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, DollarSign, Heart, MessageSquare, Phone, Search, Star, TrendingUp, User } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
  totalOrders: number;
  lifetimeValue: number;
  averageOrderValue: number;
  lastOrderDate: string;
  nextContactDate?: string;
  birthday?: string;
  anniversary?: string;
  preferences: string[];
  communicationHistory: CommunicationRecord[];
  status: 'active' | 'inactive' | 'vip';
  tags: string[];
}

interface CommunicationRecord {
  id: string;
  type: 'email' | 'phone' | 'meeting' | 'message';
  date: string;
  subject: string;
  notes: string;
}

const ClientRelationshipDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    // Mock data - in real app would fetch from database
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '(555) 123-4567',
        company: 'Tech Innovations Inc.',
        totalOrders: 8,
        lifetimeValue: 15750,
        averageOrderValue: 1968,
        lastOrderDate: '2024-01-15',
        nextContactDate: '2024-02-15',
        birthday: '1985-03-22',
        preferences: ['Vegetarian Options', 'Corporate Events', 'Morning Meetings'],
        communicationHistory: [
          {
            id: '1',
            type: 'email',
            date: '2024-01-10',
            subject: 'Follow-up on Q1 events',
            notes: 'Discussed upcoming quarterly meeting catering needs'
          }
        ],
        status: 'vip',
        tags: ['Corporate', 'Repeat Customer', 'High Value']
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        phone: '(555) 987-6543',
        totalOrders: 3,
        lifetimeValue: 4500,
        averageOrderValue: 1500,
        lastOrderDate: '2024-01-20',
        anniversary: '2023-06-15',
        preferences: ['Asian Cuisine', 'Family Events', 'Weekend Bookings'],
        communicationHistory: [
          {
            id: '2',
            type: 'phone',
            date: '2024-01-18',
            subject: 'Menu customization discussion',
            notes: 'Requested modifications for family gathering menu'
          }
        ],
        status: 'active',
        tags: ['Family Events', 'Custom Requests']
      }
    ];
    
    setClients(mockClients);
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUpcomingEvents = () => {
    const upcoming = [];
    clients.forEach(client => {
      if (client.birthday) {
        upcoming.push({
          client: client.name,
          type: 'Birthday',
          date: client.birthday,
          daysUntil: differenceInDays(new Date(client.birthday), new Date())
        });
      }
      if (client.anniversary) {
        upcoming.push({
          client: client.name,
          type: 'Anniversary',
          date: client.anniversary,
          daysUntil: differenceInDays(new Date(client.anniversary), new Date())
        });
      }
      if (client.nextContactDate) {
        upcoming.push({
          client: client.name,
          type: 'Follow-up',
          date: client.nextContactDate,
          daysUntil: differenceInDays(new Date(client.nextContactDate), new Date())
        });
      }
    });
    return upcoming.filter(event => event.daysUntil >= 0).sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedClient(client)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{client.name}</h3>
              <p className="text-sm text-gray-600">{client.email}</p>
              {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
            </div>
          </div>
          <Badge className={getStatusColor(client.status)}>
            {client.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="font-semibold text-lg">{client.totalOrders}</p>
            <p className="text-gray-600">Orders</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">${client.lifetimeValue.toLocaleString()}</p>
            <p className="text-gray-600">Lifetime Value</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">${client.averageOrderValue.toLocaleString()}</p>
            <p className="text-gray-600">Avg Order</p>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {client.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {client.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{client.tags.length - 2} more
            </Badge>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Last order: {format(new Date(client.lastOrderDate), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="space-y-6">
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
                <p className="text-sm text-gray-600">VIP Clients</p>
                <p className="text-2xl font-bold">{clients.filter(c => c.status === 'vip').length}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total CLV</p>
                <p className="text-2xl font-bold">${clients.reduce((sum, c) => sum + c.lifetimeValue, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">${Math.round(clients.reduce((sum, c) => sum + c.averageOrderValue, 0) / clients.length).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredClients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{event.client}</p>
                      <p className="text-xs text-gray-600">{event.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{event.daysUntil === 0 ? 'Today' : `${event.daysUntil} days`}</p>
                      <p className="text-xs text-gray-500">{format(new Date(event.date), 'MMM d')}</p>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Birthday Wishes
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-ups
              </Button>
              <Button className="w-full" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientRelationshipDashboard;
