import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDraftOrders, DraftOrder } from '@/hooks/use-draft-orders';
import { useUserRole } from '@/hooks/use-user-role';
import { ServiceSelection } from '@/types/order';
import { toast } from 'sonner';
import { 
  Save, 
  FolderOpen, 
  Share2, 
  Trash2, 
  Clock, 
  FileText,
  AlertCircle,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DraftRenameDialog } from '@/components/admin/DraftRenameDialog';

interface DraftManagementToolbarProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  onLoadDraft?: (draft: DraftOrder) => void;
  className?: string;
}

export const DraftManagementToolbar = ({
  selectedServices = [],
  selectedItems = {},
  formData = {},
  onLoadDraft,
  className = ''
}: DraftManagementToolbarProps) => {
  const {
    drafts,
    isLoading,
    isSaving,
    saveDraft,
    loadDraft,
    deleteDraft,
    shareWithSales,
    renameDraft,
  } = useDraftOrders();

  const { userRole } = useUserRole();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [selectedDraftForShare, setSelectedDraftForShare] = useState<string | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('currentDraftId');
    if (id) setCurrentDraftId(id);
  }, []);

  const hasUnsavedChanges = selectedServices.length > 0 || Object.keys(selectedItems).length > 0;

  const handleSaveDraft = async () => {
    const name = draftName.trim() || `Draft ${new Date().toLocaleDateString()}`;
    const savedId = await saveDraft(selectedServices, selectedItems, formData, name, currentDraftId || undefined);
    
    if (savedId) {
      setDraftName('');
      setDraftDescription('');
      setSaveDialogOpen(false);
      setCurrentDraftId(savedId);
      localStorage.setItem('currentDraftId', savedId);
    }
  };

  const handleLoadDraft = async (draftId: string) => {
    const draft = await loadDraft(draftId);
    if (draft && onLoadDraft) {
      onLoadDraft(draft);
      toast.success(`Loaded draft: ${draft.name}`);
      setCurrentDraftId(draftId);
      localStorage.setItem('currentDraftId', draftId);
    }
  };

  const handleShareDraft = async () => {
    if (!selectedDraftForShare) return;
    
    const shareToken = await shareWithSales(selectedDraftForShare, clientNotes);
    if (shareToken) {
      const shareUrl = `${window.location.origin}/draft/${shareToken}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
      setShareDialogOpen(false);
      setClientNotes('');
      setSelectedDraftForShare(null);
    }
  };

  const handleDeleteDraft = async (draftId: string, draftName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${draftName}"? This cannot be undone.`);
    if (confirmed) {
      const ok = await deleteDraft(draftId);
      if (ok && currentDraftId === draftId) {
        localStorage.removeItem('currentDraftId');
        setCurrentDraftId(null);
      }
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="flex items-center gap-2 bg-white border rounded-lg shadow-lg p-2">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-amber-600 text-xs px-2">
            <AlertCircle className="w-3 h-3" />
            Unsaved
          </div>
        )}

        {/* Quick Save */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving || !hasUnsavedChanges}
              className="flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Draft Order</DialogTitle>
              <DialogDescription>
                Save your current order configuration as a draft for later use or sharing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="draft-name">Draft Name</Label>
                <Input
                  id="draft-name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={`Draft ${new Date().toLocaleDateString()}`}
                />
              </div>
              <div>
                <Label htmlFor="draft-description">Description (Optional)</Label>
                <Textarea
                  id="draft-description"
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="Brief description of this order..."
                  rows={2}
                />
              </div>
              <div className="text-sm text-gray-500">
                <div>Services: {selectedServices.length}</div>
                <div>Items: {Object.keys(selectedItems).length}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Load Drafts */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              Load ({drafts.length})
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Saved Drafts</SheetTitle>
              <SheetDescription>
                Load a previously saved draft or share it with our sales team for assistance.
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading drafts...</div>
              ) : drafts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No saved drafts yet
                </div>
              ) : (
                drafts.map((draft) => (
                  <div key={draft.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">{draft.name}</h3>
                          <DraftRenameDialog
                            draftId={draft.id}
                            currentName={draft.name}
                            onRename={renameDraft}
                            userRole={userRole === 'super-admin' ? 'admin' : (userRole === 'event-host' ? 'host' : userRole)}
                          />
                        </div>
                        {draft.description && (
                          <p className="text-xs text-gray-600 mt-1">{draft.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={draft.shared_with_sales ? "default" : "secondary"} className="text-xs">
                          {draft.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {draft.service_count} services
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${draft.estimated_total}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                      </div>
                    </div>

                    {draft.shared_with_sales && draft.client_notes && (
                      <div className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                        <strong>Client Notes:</strong> {draft.client_notes}
                      </div>
                    )}

                    {draft.sales_notes && (
                      <div className="text-xs bg-green-50 p-2 rounded border-l-2 border-green-200">
                        <strong>Sales Notes:</strong> {draft.sales_notes}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadDraft(draft.id)}
                        className="flex items-center gap-1 text-xs"
                      >
                        <FolderOpen className="w-3 h-3" />
                        Load
                      </Button>
                      
                      {!draft.shared_with_sales && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDraftForShare(draft.id);
                            setShareDialogOpen(true);
                          }}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Share2 className="w-3 h-3" />
                          Share
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDraft(draft.id, draft.name)}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share with Sales Team</DialogTitle>
              <DialogDescription>
                Share this draft with our sales team for assistance with planning and customization.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client-notes">Message to Sales Team</Label>
                <Textarea
                  id="client-notes"
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Let us know what you're looking for, any specific requirements, or questions you have..."
                  rows={3}
                />
              </div>
              <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded">
                <div className="flex items-center gap-2 font-medium text-blue-700 mb-1">
                  <Users className="w-4 h-4" />
                  What happens next?
                </div>
                <ul className="text-blue-600 text-xs space-y-1">
                  <li>• Our sales team will review your draft order</li>
                  <li>• They may suggest improvements or alternatives</li>
                  <li>• You'll receive updates when changes are made</li>
                  <li>• The shared link expires in 30 days</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleShareDraft}>
                Share Draft
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};