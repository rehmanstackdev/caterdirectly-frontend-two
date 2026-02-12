
import { useState, useEffect } from "react";
import { MessageSquare, Search, Filter, MoreHorizontal, RefreshCcw, User, Package, Loader2 } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAdminPermissions } from "@/hooks/use-admin-permissions";
import supportService, { SupportStatusEnum, type SupportTicket } from "@/services/api/support.service";
import { SupportTicketDetailDialog } from "@/components/admin/support/SupportTicketDetailDialog";

function SupportTicketsManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportStatusEnum | "all">("all");
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const { hasPermission } = useAdminPermissions();
  
  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const filterStatus = statusFilter !== "all" ? statusFilter : undefined;
      const response = await supportService.getAllSupportTickets(filterStatus);
      
      console.log('Support tickets response:', response);
      
      // Backend returns: {status: 200, response: "OK", message: "...", data: [...]}
      // BaseRequestService returns result.data, so response is the whole backend response
      if (response && response.data) {
        setTickets(response.data);
      } else if (Array.isArray(response)) {
        // In case the response is directly the array
        setTickets(response);
      } else {
        throw new Error(response?.message || 'Failed to fetch support tickets');
      }
    } catch (error: any) {
      console.error("Error fetching support tickets:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load support tickets. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    // Apply search query filter
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy?.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
  const updateTicketStatus = async (ticketId: string, newStatus: SupportStatusEnum) => {
    if (!hasPermission('support', 'manage')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to manage support tickets.",
        variant: "destructive"
      });
      return;
    }
    
    // Set updating state
    setUpdatingTicketId(ticketId);
    
    // Optimistic update
    const previousTickets = [...tickets];
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
    
    try {
      const response = await supportService.updateSupportTicketStatus(ticketId, newStatus);
      
      console.log('Update ticket response:', response);
      
      // Backend returns: {status: 200, response: "OK", message: "...", data: {...}}
      if (response && (response.status === 200 || response.data)) {
        toast({
          title: "Ticket Updated",
          description: `Support ticket status has been updated to ${newStatus}.`
        });
        
        // Refresh tickets to get the latest data from backend
        await fetchTickets();
      } else {
        // Revert optimistic update on failure
        setTickets(previousTickets);
        throw new Error(response?.message || 'Failed to update ticket status');
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setTickets(previousTickets);
      
      console.error("Error updating ticket status:", error);
      
      // Extract error message from response
      const errorMessage = error.response?.data?.message || error.message || "Failed to update ticket status. Please try again.";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const getStatusBadge = (status: SupportStatusEnum) => {
    switch (status) {
      case SupportStatusEnum.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case SupportStatusEnum.INVESTIGATING:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Investigating</Badge>;
      case SupportStatusEnum.RESOLVED:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case SupportStatusEnum.REJECTED:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryLabels: Record<string, string> = {
      'general_support': 'General',
      'technical_issue': 'Technical',
      'billing_payment': 'Billing',
      'account_management': 'Account',
    };
    return <Badge variant="outline">{categoryLabels[category] || category}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const openTicketDetail = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setDetailDialogOpen(true);
  };

  return (
    <Dashboard userRole="admin" activeTab="support">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Manage customer and vendor support requests</p>
          </div>
          <Button variant="outline" onClick={fetchTickets}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tickets by subject, message, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(SupportStatusEnum.PENDING)}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(SupportStatusEnum.INVESTIGATING)}>
                Investigating
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(SupportStatusEnum.RESOLVED)}>
                Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter(SupportStatusEnum.REJECTED)}>
                Rejected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                      </div>
                      <div className="mt-2">Loading support tickets...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredTickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      {tickets.length === 0 ? (
                        <div>
                          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                          <p>No support tickets have been submitted yet.</p>
                        </div>
                      ) : (
                        <p>No tickets match your search. Try adjusting your query.</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => openTicketDetail(ticket.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">
                              {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{ticket.createdBy?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs" title={ticket.message}>
                            {ticket.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(ticket.category)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(ticket.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                          <p className="text-xs text-gray-500">
                            {new Date(ticket.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {[SupportStatusEnum.RESOLVED, SupportStatusEnum.REJECTED].includes(ticket.status) ? (
                          <div className="text-sm">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                            <p className="text-xs text-gray-500">
                              {new Date(ticket.updatedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {updatingTicketId === ticket.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            <span className="text-xs text-gray-500">Updating...</span>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={updatingTicketId !== null}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {ticket.status === SupportStatusEnum.PENDING && (
                                <DropdownMenuItem 
                                  onClick={() => updateTicketStatus(ticket.id, SupportStatusEnum.INVESTIGATING)}
                                  disabled={!hasPermission('support', 'manage') || updatingTicketId !== null}
                                >
                                  Start Investigation
                                </DropdownMenuItem>
                              )}
                              
                              {[SupportStatusEnum.PENDING, SupportStatusEnum.INVESTIGATING].includes(ticket.status) && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => updateTicketStatus(ticket.id, SupportStatusEnum.RESOLVED)}
                                    disabled={!hasPermission('support', 'manage') || updatingTicketId !== null}
                                  >
                                    Mark as Resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => updateTicketStatus(ticket.id, SupportStatusEnum.REJECTED)}
                                    disabled={!hasPermission('support', 'manage') || updatingTicketId !== null}
                                  >
                                    Reject Ticket
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {ticket.orderId && (
                                <DropdownMenuItem>View Order Details</DropdownMenuItem>
                              )}
                              <DropdownMenuItem>Contact User</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openTicketDetail(ticket.id)}>
                                View Full Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Support Ticket Detail Dialog */}
      <SupportTicketDetailDialog
        ticketId={selectedTicketId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onStatusUpdate={() => {
          fetchTickets();
        }}
      />
    </Dashboard>
  );
}

export default SupportTicketsManagement;
