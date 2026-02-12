
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Eye, FileText, MessageSquare, Plus, Search, Send, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { useVendorProposals } from '@/hooks/vendor/use-vendor-invoices';

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  status: 'draft' | 'sent' | 'viewed' | 'negotiation' | 'accepted' | 'rejected' | 'expired';
  total: number;
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  expiryDate: string;
  followUpDate?: string;
  eventDate?: string;
  eventType: string;
  responseRate: number;
}

const ProposalsManager: React.FC = () => {
  const { invoices: proposals, loading } = useVendorProposals();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templates] = useState([
    { id: '1', name: 'Corporate Event Package', type: 'corporate', basePrice: 2500 },
    { id: '2', name: 'Birthday Party Catering', type: 'birthday', basePrice: 800 },
    { id: '3', name: 'Wedding Reception', type: 'wedding', basePrice: 5000 },
    { id: '4', name: 'Holiday Party', type: 'holiday', basePrice: 1500 },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  const getConversionRate = () => {
    const totalSent = proposals.filter(p => ['sent', 'viewed', 'negotiation', 'accepted', 'rejected'].includes(p.status)).length;
    const accepted = proposals.filter(p => p.status === 'accepted').length;
    return totalSent > 0 ? Math.round((accepted / totalSent) * 100) : 0;
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
    const daysUntilExpiry = getDaysUntilExpiry(proposal.expiryDate);
    const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{proposal.title}</h3>
              <p className="text-sm text-gray-600">{proposal.clientName}</p>
              <p className="text-xs text-gray-500">{proposal.clientEmail}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status.toUpperCase()}
              </Badge>
              {isExpiringSoon && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {daysUntilExpiry} days left
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              ${proposal.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {proposal.eventDate ? format(new Date(proposal.eventDate), 'MMM d, yyyy') : 'TBD'}
            </div>
          </div>

          {proposal.status === 'sent' || proposal.status === 'viewed' ? (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Response Rate</span>
                <span>{proposal.responseRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${proposal.responseRate}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              {proposal.status === 'draft' && (
                <Button size="sm" className="bg-[#F07712] hover:bg-[#F07712]/90">
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {proposal.sentAt ? 
                `Sent ${format(new Date(proposal.sentAt), 'MMM d')}` :
                `Created ${format(new Date(proposal.createdAt), 'MMM d')}`
              }
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F07712] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Proposals Management</h2>
          <p className="text-gray-600">Track and manage all your client proposals</p>
        </div>
        <Link to="/vendor/new-proposal">
          <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Proposal
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Proposals</p>
                <p className="text-2xl font-bold">{proposals.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{getConversionRate()}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Response</p>
                <p className="text-2xl font-bold">{proposals.filter(p => ['sent', 'viewed', 'negotiation'].includes(p.status)).length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${proposals.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search proposals or clients..."
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
            <SelectItem value="all">All Proposals</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="negotiation">Negotiation</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Proposals</TabsTrigger>
          <TabsTrigger value="templates">Quick Templates</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups Needed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProposals.map(proposal => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
          {filteredProposals.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No proposals found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">Starting at ${template.basePrice.toLocaleString()}</p>
                  <Button className="w-full bg-[#F07712] hover:bg-[#F07712]/90">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="follow-ups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.filter(p => ['sent', 'viewed', 'negotiation'].includes(p.status)).map(proposal => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProposalsManager;
