
import React, { useState } from "react";
import { MessageSquare, Search, Plus, Filter, RefreshCcw, Check, X, FileText, MessageCircle, LifeBuoy } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for support tickets
const mockTickets = [
  {
    id: "TKT-10285",
    subject: "Payment processing issue",
    status: "open",
    priority: "high",
    customer: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"
    },
    createdAt: "2025-04-28T14:30:00Z",
    lastUpdateAt: "2025-04-29T10:15:00Z",
    assignedTo: "Support Team"
  },
  {
    id: "TKT-10284",
    subject: "Unable to upload service images",
    status: "in_progress",
    priority: "medium",
    customer: {
      name: "Maria Rodriguez",
      email: "maria.r@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    createdAt: "2025-04-27T09:42:00Z",
    lastUpdateAt: "2025-04-29T08:30:00Z",
    assignedTo: "Tech Support"
  },
  {
    id: "TKT-10283",
    subject: "Vendor account verification",
    status: "pending_info",
    priority: "medium",
    customer: {
      name: "Robert Chen",
      email: "robert.c@example.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    },
    createdAt: "2025-04-26T16:15:00Z",
    lastUpdateAt: "2025-04-28T11:20:00Z",
    assignedTo: "Verification Team"
  },
  {
    id: "TKT-10282",
    subject: "Refund for cancelled order",
    status: "closed",
    priority: "high",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
    },
    createdAt: "2025-04-25T10:30:00Z",
    lastUpdateAt: "2025-04-27T15:45:00Z",
    assignedTo: "Billing Support"
  },
  {
    id: "TKT-10281",
    subject: "Feature request: Calendar integration",
    status: "open",
    priority: "low",
    customer: {
      name: "David Wilson",
      email: "david.w@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
    },
    createdAt: "2025-04-24T14:20:00Z",
    lastUpdateAt: "2025-04-24T14:20:00Z",
    assignedTo: "Product Team"
  }
];

// Mock data for knowledge base articles
const mockArticles = [
  {
    id: "kb-1",
    title: "How to create a vendor account",
    category: "Vendor Support",
    views: 2456,
    lastUpdated: "2025-04-15T10:30:00Z",
    status: "published"
  },
  {
    id: "kb-2",
    title: "Processing refunds for cancelled orders",
    category: "Billing",
    views: 1287,
    lastUpdated: "2025-04-10T14:15:00Z",
    status: "published"
  },
  {
    id: "kb-3",
    title: "Setting up two-factor authentication",
    category: "Security",
    views: 975,
    lastUpdated: "2025-04-05T09:45:00Z",
    status: "published"
  },
  {
    id: "kb-4",
    title: "New payment gateway integration guide",
    category: "Technical",
    views: 532,
    lastUpdated: "2025-04-28T16:20:00Z",
    status: "draft"
  }
];

function SupportTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  // Filter tickets based on search and filters
  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Filter articles based on search
  const filteredArticles = mockArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending_info":
        return "bg-purple-100 text-purple-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dashboard userRole="super-admin" activeTab="support">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Support Tools</h1>
          
          <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Open Tickets</p>
                  <p className="text-3xl font-bold">24</p>
                  <p className="text-sm text-amber-600 mt-1">+5 since yesterday</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg. Response Time</p>
                  <p className="text-3xl font-bold">4.2 hrs</p>
                  <p className="text-sm text-green-600 mt-1">-0.5 hrs from last week</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <MessageCircle className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">KB Articles</p>
                  <p className="text-3xl font-bold">86</p>
                  <p className="text-sm text-green-600 mt-1">+3 new articles this week</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Search tickets and knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="tickets">
          <TabsList className="mb-4">
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="analytics">Support Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl">Support Tickets</CardTitle>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="w-[140px]">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending_info">Pending Info</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-[140px]">
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Ticket
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">{ticket.id}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{ticket.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={ticket.customer.avatar} alt={ticket.customer.name} />
                              <AvatarFallback>{ticket.customer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{ticket.customer.name}</p>
                              <p className="text-xs text-gray-500">{ticket.customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>{ticket.assignedTo}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="knowledge">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Knowledge Base Articles</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Article
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.category}</TableCell>
                        <TableCell>{article.views.toLocaleString()}</TableCell>
                        <TableCell>{formatDate(article.lastUpdated)}</TableCell>
                        <TableCell>
                          <Badge className={article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {article.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <LifeBuoy className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">Support Analytics</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  This module will provide comprehensive analytics on support ticket metrics, response times, and customer satisfaction.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default SupportTools;
