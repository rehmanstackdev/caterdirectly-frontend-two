import { useState, useCallback, useEffect } from 'react';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDraftOrders, DraftOrder } from '@/hooks/use-draft-orders';
import { useCartTemplates } from '@/hooks/use-cart-templates';
import { useDraftAnalytics } from '@/hooks/use-draft-analytics';
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
  DollarSign,
  ChevronDown,
  Copy,
  Download,
  BarChart3,
  BookmarkPlus,
  Settings,
  Eye,
  MessageSquare,
  History,
  Zap,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedDraftManagementToolbarProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  onLoadDraft?: (draft: DraftOrder) => void;
  className?: string;
}

export const EnhancedDraftManagementToolbar = ({
  selectedServices = [],
  selectedItems = {},
  formData = {},
  onLoadDraft,
  className = ''
}: EnhancedDraftManagementToolbarProps) => {
  const {
    drafts,
    isLoading,
    isSaving,
    saveDraft,
    loadDraft,
    deleteDraft,
    shareWithSales,
  } = useDraftOrders();

  const {
    templates,
    publicTemplates,
    saveTemplate,
    useTemplate,
    deleteTemplate,
  } = useCartTemplates();

  const { logEvent } = useDraftAnalytics();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [selectedDraftForShare, setSelectedDraftForShare] = useState<string | null>(null);
  const [autoSaveProgress, setAutoSaveProgress] = useState(0);

  const hasUnsavedChanges = selectedServices.length > 0 || Object.keys(selectedItems).length > 0;

  // Auto-save progress simulation
  useEffect(() => {
    if (hasUnsavedChanges) {
      const interval = setInterval(() => {
        setAutoSaveProgress(prev => {
          if (prev >= 100) {
            return 0; // Reset after auto-save
          }
          return prev + 3.33; // 30 seconds / 9 updates = ~3.33% per update
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setAutoSaveProgress(0);
    }
  }, [hasUnsavedChanges]);

  const handleSaveDraft = useCallback(async () => {
    const name = draftName.trim() || `Draft ${new Date().toLocaleDateString()}`;
    const savedId = await saveDraft(selectedServices, selectedItems, formData, name);
    
    if (savedId) {
      await logEvent(savedId, 'created');
      setDraftName('');
      setDraftDescription('');
      setSaveDialogOpen(false);
      toast.success('Draft saved with enhanced metadata!');
    }
  }, [draftName, selectedServices, selectedItems, formData, saveDraft, logEvent]);

  const handleLoadDraft = useCallback(async (draftId: string) => {
    const draft = await loadDraft(draftId);
    if (draft && onLoadDraft) {
      await logEvent(draftId, 'viewed');
      onLoadDraft(draft);
      toast.success(`Loaded draft: ${draft.name}`);
    }
  }, [loadDraft, onLoadDraft, logEvent]);

  const handleSaveAsTemplate = useCallback(async () => {
    const name = templateName.trim();
    if (!name) {
      toast.error('Please enter a template name');
      return;
    }

    const savedId = await saveTemplate(
      name,
      selectedServices,
      selectedItems,
      [], // sections - will be enhanced later
      templateDescription,
      'custom',
      false
    );

    if (savedId) {
      setTemplateName('');
      setTemplateDescription('');
      setTemplateDialogOpen(false);
      toast.success('Template saved successfully!');
    }
  }, [templateName, templateDescription, selectedServices, selectedItems, saveTemplate]);

  const handleUseTemplate = useCallback(async (templateId: string) => {
    const template = await useTemplate(templateId);
    if (template && onLoadDraft) {
      // Convert template to draft format
      const draftData = {
        ...template,
        id: template.id,
        user_id: template.user_id,
        form_data: {},
        status: 'draft' as const,
        shared_with_sales: false,
        estimated_total: template.usage_count * 100, // Placeholder
        service_count: template.selected_services.length,
        last_accessed_at: new Date().toISOString(),
        sales_notes: undefined,
        client_notes: undefined,
        share_token: undefined,
        expires_at: undefined,
      };
      onLoadDraft(draftData);
      toast.success(`Applied template: ${template.name}`);
    }
  }, [useTemplate, onLoadDraft]);

  const handleExportDraft = useCallback((draft: DraftOrder) => {
    const exportData = {
      name: draft.name,
      created_at: draft.created_at,
      estimated_total: draft.estimated_total,
      service_count: draft.service_count,
      selected_services: draft.selected_services,
      selected_items: draft.selected_items,
      form_data: draft.form_data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${String(draft.name).replace(/[^a-z0-9]/gi, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logEvent(draft.id, 'exported');
    toast.success('Draft exported successfully!');
  }, [logEvent]);

  const calculateTotalValue = useCallback(() => {
    // Enhanced calculation with real pricing logic
    const serviceTotal = selectedServices.reduce((sum, service) => {
      const priceStr = typeof service.price === 'string' ? service.price : String(service.price || '0');
      return sum + (parseFloat(priceStr.replace(/[$,]/g, '') || '0') || 0);
    }, 0);
    
    const itemTotal = Object.entries(selectedItems).reduce((sum, [itemId, quantity]) => {
      // In a real app, you'd fetch actual item prices
      return sum + (quantity * 50); // Placeholder calculation
    }, 0);

    return serviceTotal + itemTotal;
  }, [selectedServices, selectedItems]);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border rounded-xl shadow-lg p-2 text-sm">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-amber-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  Auto-saving...
                </div>
                <Progress value={autoSaveProgress} className="w-16 h-1" />
              </div>
            </div>
          )}
          
          {!hasUnsavedChanges && (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Zap className="w-3 h-3" />
              Saved
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="text-xs text-gray-600 px-2 border-l">
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {selectedServices.length} services
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            ${calculateTotalValue().toLocaleString()}
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex items-center gap-1">
          {/* Quick Save */}
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                disabled={isSaving || !hasUnsavedChanges}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-3 h-3" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Save Draft Order</DialogTitle>
                <DialogDescription>
                  Save your current order configuration with enhanced tracking.
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
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
                  <div>
                    <div className="font-medium">Services</div>
                    <div className="text-gray-600">{selectedServices.length}</div>
                  </div>
                  <div>
                    <div className="font-medium">Estimated Total</div>
                    <div className="text-gray-600">${calculateTotalValue().toLocaleString()}</div>
                  </div>
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

          {/* Load/Manage Drafts */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                Drafts ({drafts.length})
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[500px] sm:w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Draft Management</SheetTitle>
                <SheetDescription>
                  Manage your saved drafts, templates, and collaboration.
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <BookmarkPlus className="w-3 h-3" />
                        Save as Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save as Template</DialogTitle>
                        <DialogDescription>
                          Create a reusable template from your current cart.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="template-name">Template Name</Label>
                          <Input
                            id="template-name"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="My Custom Template"
                          />
                        </div>
                        <div>
                          <Label htmlFor="template-description">Description</Label>
                          <Textarea
                            id="template-description"
                            value={templateDescription}
                            onChange={(e) => setTemplateDescription(e.target.value)}
                            placeholder="Description of this template..."
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveAsTemplate}>
                          Save Template
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Templates Section */}
                {(templates.length > 0 || publicTemplates.length > 0) && (
                  <div>
                    <h3 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Quick Templates
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {templates.slice(0, 4).map((template) => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(template.id)}
                          className="text-xs h-auto p-2 flex flex-col items-start"
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-gray-500">{template.selected_services.length} services</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drafts List */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Saved Drafts
                  </h3>
                  {isLoading ? (
                    <div className="text-center py-4 text-gray-500">Loading drafts...</div>
                  ) : drafts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No saved drafts yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {drafts.map((draft) => (
                        <div key={draft.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{draft.name}</h4>
                              {draft.description && (
                                <p className="text-xs text-gray-600 mt-1">{draft.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={draft.shared_with_sales ? "default" : "secondary"} className="text-xs">
                                {draft.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-auto p-1">
                                    <Settings className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleLoadDraft(draft.id)}>
                                    <Eye className="w-3 h-3 mr-2" />
                                    Load Draft
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleExportDraft(draft)}>
                                    <Download className="w-3 h-3 mr-2" />
                                    Export
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => deleteDraft(draft.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {draft.service_count} services
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${draft.estimated_total.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                            </div>
                          </div>

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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Analytics */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalyticsDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <BarChart3 className="w-3 h-3" />
          </Button>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share with Sales Team</DialogTitle>
              <DialogDescription>
                Share this draft with our sales team for personalized assistance.
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
                  Enhanced Collaboration Features
                </div>
                <ul className="text-blue-600 text-xs space-y-1">
                  <li>• Real-time comments and suggestions</li>
                  <li>• Revision history tracking</li>
                  <li>• Automatic price optimization</li>
                  <li>• Expert recommendations</li>
                  <li>• 30-day secure access</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={async () => {
                if (selectedDraftForShare) {
                  const shareToken = await shareWithSales(selectedDraftForShare, clientNotes);
                  if (shareToken) {
                    await logEvent(selectedDraftForShare, 'shared');
                    const shareUrl = `${window.location.origin}/draft/${shareToken}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Share link copied! Sales team notified.');
                    setShareDialogOpen(false);
                    setClientNotes('');
                    setSelectedDraftForShare(null);
                  }
                }
              }}>
                Share & Notify Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};