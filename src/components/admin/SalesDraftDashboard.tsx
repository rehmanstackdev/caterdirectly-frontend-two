import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useDraftComments } from '@/hooks/use-draft-comments';
import { DraftOrder } from '@/hooks/use-draft-orders';
import { toast } from 'sonner';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  Send,
  Eye,
  Edit3,
  Archive
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ExtendedDraftOrder extends DraftOrder {
  client_name?: string;
  client_email?: string;
}

interface SalesDraftDashboardProps {
  className?: string;
}

export const SalesDraftDashboard = ({
  className = ''
}: SalesDraftDashboardProps) => {
  const [sharedDrafts, setSharedDrafts] = useState<ExtendedDraftOrder[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [salesNotes, setSalesNotes] = useState('');
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const { user } = useAuth();

  const {
    comments,
    addComment,
    isLoading: commentsLoading,
  } = useDraftComments(selectedDraftId || '');

  const loadSharedDrafts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('draft_orders')
        .select('*')
        .eq('shared_with_sales', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const draftsWithUserData = (data || []).map(draft => ({
        ...draft,
        selected_services: (draft.selected_services as any) || [],
        selected_items: (draft.selected_items as any) || {},
        form_data: (draft.form_data as any) || {},
        estimated_total: draft.estimated_total || 0,
        service_count: draft.service_count || 0,
        shared_with_sales: draft.shared_with_sales || false,
        status: (draft.status as any) || 'draft',
        client_name: 'Client Name', // Simplified for now
        client_email: 'client@example.com', // Simplified for now
      }));

      setSharedDrafts(draftsWithUserData);
    } catch (error) {
      console.error('Failed to load shared drafts:', error);
      toast.error('Failed to load shared drafts');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDraftStatus = async (draftId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status };
      if (notes) {
        updateData.sales_notes = notes;
      }

      const { error } = await supabase
        .from('draft_orders')
        .update(updateData)
        .eq('id', draftId);

      if (error) throw error;

      toast.success('Draft status updated successfully');
      await loadSharedDrafts();
      setResponseDialogOpen(false);
      setSalesNotes('');
    } catch (error) {
      console.error('Failed to update draft:', error);
      toast.error('Failed to update draft');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shared': return 'bg-blue-100 text-blue-700';
      case 'in_review': return 'bg-yellow-100 text-yellow-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'converted': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDashboardStats = () => {
    const total = sharedDrafts.length;
    const pending = sharedDrafts.filter(d => d.status === 'shared').length;
    const inReview = sharedDrafts.filter(d => d.status === 'in_review').length;
    const approved = sharedDrafts.filter(d => d.status === 'approved').length;
    const totalValue = sharedDrafts.reduce((sum, d) => sum + (d.estimated_total || 0), 0);

    return { total, pending, inReview, approved, totalValue };
  };

  useEffect(() => {
    if (user) {
      loadSharedDrafts();
    }
  }, [user]);

  // Set up real-time subscription for shared drafts
  useEffect(() => {
    const channel = supabase
      .channel('sales-drafts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_orders',
          filter: 'shared_with_sales=eq.true',
        },
        () => {
          loadSharedDrafts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const stats = getDashboardStats();

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">Loading sales dashboard...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Sales Draft Dashboard</h2>
        <p className="text-gray-600">Manage shared drafts and collaborate with clients</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Drafts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.inReview}</div>
                <div className="text-sm text-gray-600">In Review</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drafts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Shared Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in_review">In Review</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-3">
                  {sharedDrafts.map((draft) => (
                    <div 
                      key={draft.id} 
                      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedDraftId === draft.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedDraftId(draft.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{draft.name}</h3>
                            <Badge className={`text-xs ${getStatusColor(draft.status)}`}>
                              {draft.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Client: {draft.client_name} ({draft.client_email})</div>
                            <div className="flex items-center gap-4">
                              <span>{draft.service_count} services</span>
                              <span>${draft.estimated_total.toLocaleString()}</span>
                              <span>{formatDistanceToNow(new Date(draft.created_at))} ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDraftId(draft.id);
                              setResponseDialogOpen(true);
                            }}
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Respond
                          </Button>
                        </div>
                      </div>

                      {draft.client_notes && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <strong>Client Notes:</strong> {draft.client_notes}
                        </div>
                      )}

                      {draft.sales_notes && (
                        <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                          <strong>Your Notes:</strong> {draft.sales_notes}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="pending">
                  {sharedDrafts.filter(d => d.status === 'shared').map((draft) => (
                    // Same card structure as above
                    <div key={draft.id} className="border rounded-lg p-4">
                      {/* Card content */}
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Selected Draft Details */}
        <div>
          {selectedDraftId ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments & Collaboration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading comments...</div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No comments yet</div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border-l-2 border-blue-200 pl-3">
                          <div className="text-sm">
                            <strong>{comment.user_name}</strong>
                            {comment.user_role === 'admin' && (
                              <Badge variant="outline" className="ml-2 text-xs">Sales</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{comment.comment}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(comment.created_at))} ago
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="border-t pt-3">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a comment or suggestion..."
                        className="flex-1 min-h-[60px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const comment = e.currentTarget.value.trim();
                            if (comment) {
                              addComment(comment, 'suggestion', false);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Select a draft to view details and collaborate
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Client</DialogTitle>
            <DialogDescription>
              Update the draft status and add notes for the client.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sales-notes">Response Notes</Label>
              <Textarea
                id="sales-notes"
                value={salesNotes}
                onChange={(e) => setSalesNotes(e.target.value)}
                placeholder="Add your response, suggestions, or questions..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => selectedDraftId && updateDraftStatus(selectedDraftId, 'in_review', salesNotes)}
                className="flex-1"
              >
                Mark In Review
              </Button>
              <Button
                onClick={() => selectedDraftId && updateDraftStatus(selectedDraftId, 'approved', salesNotes)}
                className="flex-1"
              >
                Approve Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};