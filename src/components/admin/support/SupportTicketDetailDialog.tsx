import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Package,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import supportService, { SupportStatusEnum, type SupportTicket } from '@/services/api/support.service';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SupportTicketDetailDialogProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: () => void;
}

export function SupportTicketDetailDialog({
  ticketId,
  open,
  onOpenChange,
  onStatusUpdate,
}: SupportTicketDetailDialogProps) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && ticketId) {
      fetchTicketDetails();
    }
  }, [open, ticketId]);

  const fetchTicketDetails = async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const response = await supportService.getSupportTicketById(ticketId);
      
      console.log('Ticket detail response:', response);
      
      // Backend returns: {status: 200, response: "OK", message: "...", data: {...}}
      if (response && response.data) {
        setTicket(response.data);
      } else if (response && !response.data && response.id) {
        // In case response is directly the ticket object
        setTicket(response);
      } else {
        throw new Error(response?.message || 'Failed to fetch ticket details');
      }
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load ticket details. Please try again.',
        variant: 'destructive',
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
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

  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      'general_support': 'General Support',
      'technical_issue': 'Technical Issue',
      'billing_payment': 'Billing & Payment',
      'account_management': 'Account Management',
    };
    return categoryLabels[category] || category;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Support Ticket Details</DialogTitle>
          <DialogDescription>
            View complete information about this support ticket
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading ticket details...</p>
            </div>
          </div>
        ) : ticket ? (
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="space-y-6 pr-4">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{ticket.subject}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Ticket ID: {ticket.id.slice(0, 8)}...</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>

              <Separator />

              {/* User Information */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Submitted By
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{ticket.createdBy?.email}</span>
                      </div>
                      {ticket.createdBy && 'phone' in ticket.createdBy && (ticket.createdBy as any).phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone className="h-3 w-3" />
                          <span>{(ticket.createdBy as any).phone}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Contact User
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Ticket Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium">{getCategoryLabel(ticket.category)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Priority</p>
                    <p className="font-medium capitalize">{ticket.priority}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created
                    </p>
                    <p className="font-medium">
                      {format(new Date(ticket.createdAt), 'PPP')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.createdAt), 'p')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last Updated
                    </p>
                    <p className="font-medium">
                      {format(new Date(ticket.updatedAt), 'PPP')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(ticket.updatedAt), 'p')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Information */}
              {ticket.orderId && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Related Order
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order ID: {ticket.orderId.slice(0, 8)}...</p>
                          <p className="text-sm text-gray-600 mt-1">
                            This ticket is related to a specific order
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Order
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Message Content */}
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Message
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                {ticket.status === SupportStatusEnum.PENDING && (
                  <Button
                    onClick={() => {
                      onOpenChange(false);
                      onStatusUpdate?.();
                    }}
                  >
                    Start Investigation
                  </Button>
                )}
                {[SupportStatusEnum.PENDING, SupportStatusEnum.INVESTIGATING].includes(ticket.status) && (
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onOpenChange(false);
                      onStatusUpdate?.();
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load ticket details</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
