import { useState, useEffect, useMemo } from 'react';
import { ServiceSelection } from '@/types/order';
import { useEnhancedDraftOrders } from '@/hooks/use-enhanced-draft-orders';
import { useUserRole } from '@/hooks/use-user-role';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Clock, Check, AlertCircle, Loader2, ChevronDown } from 'lucide-react';
import { DraftRenameDialog } from '@/components/admin/DraftRenameDialog';
import { cn } from '@/lib/utils';


interface EnhancedCartManagementProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  onLoadDraft?: (draft: any) => void;
  className?: string;
}

export const EnhancedCartManagement = ({
  selectedServices,
  selectedItems,
  formData,
  onLoadDraft,
  className
}: EnhancedCartManagementProps) => {
  const [draftName, setDraftName] = useState('');
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [lastSavedState, setLastSavedState] = useState<string>('');
  
  const {
    drafts,
    isLoading,
    isSaving,
    saveStatus,
    lastSaveTime,
    saveDraft,
    autoSave,
    loadDrafts,
    renameDraft
  } = useEnhancedDraftOrders();

  const { userRole } = useUserRole();

  // Restore last active draft from localStorage
  useEffect(() => {
    const id = localStorage.getItem('currentDraftId');
    if (id) setCurrentDraftId(id);
  }, []);

  // Create a hash of current state for change detection
  const currentState = useMemo(() => {
    return JSON.stringify({
      services: selectedServices,
      items: selectedItems,
      form: formData
    });
  }, [selectedServices, selectedItems, formData]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return currentState !== lastSavedState && (selectedServices.length > 0 || Object.keys(selectedItems).length > 0);
  }, [currentState, lastSavedState, selectedServices, selectedItems]);

  // Smart auto-save with draft ID tracking
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timeoutId = setTimeout(async () => {
        const savedId = await autoSave(selectedServices, selectedItems, formData, currentDraftId);
        if (savedId && !currentDraftId) {
          // Update currentDraftId if a new auto-save draft was created
          setCurrentDraftId(savedId);
          localStorage.setItem('currentDraftId', savedId);
        }
        setLastSavedState(currentState);
      }, 3000); // 3 second delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, selectedServices, selectedItems, formData, currentDraftId, autoSave, currentState]);

  const handleManualSave = async () => {
    const name = draftName.trim() || `Draft ${new Date().toLocaleDateString()}`;
    
    const savedId = await saveDraft(
      selectedServices,
      selectedItems,
      formData,
      name,
      currentDraftId
    );
    
    if (savedId) {
      setCurrentDraftId(savedId);
      localStorage.setItem('currentDraftId', savedId);
      setLastSavedState(currentState);
      setDraftName('');
    }
  };
  const handleSelectDraft = (draft: any) => {
    setCurrentDraftId(draft.id);
    localStorage.setItem('currentDraftId', draft.id);
    onLoadDraft?.(draft);
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const hasContent = selectedServices.length > 0 || Object.keys(selectedItems).length > 0;

  // Don't show anything if no content and no drafts
  if (!hasContent && drafts.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-white border rounded-lg p-3 shadow-sm", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="default" className="w-full justify-between h-11">
            <div className="flex items-center gap-2">
              {getSaveStatusIcon()}
              <span className="text-sm font-medium">
                {saveStatus === 'saving' ? 'Saving...' : 
                 saveStatus === 'success' ? 'Saved' : 
                 saveStatus === 'error' ? 'Save failed' : 
                 'Save Progress'}
              </span>
              {selectedServices.length > 0 && (
                <Badge variant="default" className="text-xs bg-orange-500">
                  {selectedServices.length} {selectedServices.length === 1 ? 'Service' : 'Services'}
                </Badge>
              )}
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  Unsaved
                </Badge>
              )}
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          {/* Save Section */}
          {hasContent && (
            <>
              <DropdownMenuLabel>Save Progress</DropdownMenuLabel>
              {hasUnsavedChanges ? (
                <div className="px-2 pb-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Draft name (optional)"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="h-8 text-xs flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualSave();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleManualSave}
                      disabled={isSaving}
                      className="h-8 text-xs"
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="px-2 pb-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    {lastSaveTime ? 
                      `Last saved ${new Date(lastSaveTime).toLocaleTimeString()}` : 
                      'No changes to save'}
                  </div>
                </div>
              )}
              {drafts.length > 0 && <DropdownMenuSeparator />}
            </>
          )}

          {/* Recent Drafts Section */}
          {drafts.length > 0 && (
            <>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Recent Drafts</span>
                <Badge variant="secondary" className="text-xs">
                  {drafts.length}
                </Badge>
              </DropdownMenuLabel>
              {drafts.slice(0, 3).map((draft) => (
                <DropdownMenuItem
                  key={draft.id}
                  onClick={() => handleSelectDraft(draft)}
                  className="flex-col items-start p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="font-medium text-sm truncate flex-1">{draft.name}</div>
                    <DraftRenameDialog
                      draftId={draft.id}
                      currentName={draft.name}
                      onRename={renameDraft}
                      userRole={userRole === 'super-admin' ? 'admin' : (userRole === 'event-host' ? 'host' : userRole)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {draft.service_count} services • {new Date(draft.updated_at).toLocaleDateString()}
                    {draft.estimated_total > 0 && (
                      <span> • ${draft.estimated_total}</span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              {drafts.length > 3 && (
                <DropdownMenuItem
                  onClick={loadDrafts}
                  disabled={isLoading}
                  className="justify-center"
                >
                  {isLoading ? 
                    <Loader2 className="h-3 w-3 animate-spin" /> : 
                    `View all ${drafts.length} drafts`}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};