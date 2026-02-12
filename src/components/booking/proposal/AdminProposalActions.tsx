
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAssignDraft } from '@/hooks/use-assign-draft';
import { AdminAssignToClientDialog } from './AdminAssignToClientDialog';
import { Share2 } from 'lucide-react';

interface AdminProposalActionsProps {
  selectedServices: any[];
  selectedItems: Record<string, any>;
  formData: Record<string, any>;
  className?: string;
}

const AdminProposalActions = ({
  selectedServices,
  selectedItems,
  formData,
  className,
}: AdminProposalActionsProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastDraftLink, setLastDraftLink] = useState<string | null>(null);
  const { toast } = useToast();
  const { assignToClientByEmail } = useAssignDraft();

  const handleAssign = async (email: string) => {
    const { draftId } = await assignToClientByEmail({
      clientEmail: email,
      selectedServices,
      selectedItems,
      formData,
      name: formData?.orderName || 'Proposal Draft',
    });

    const link = `/booking?draft=${draftId}`;
    setLastDraftLink(link);
    toast({
      title: 'Draft Assigned',
      description: 'The draft has been created for the client. You can share the link with them.',
    });
  };

  const handleCopyLink = async () => {
    if (!lastDraftLink) {
      toast({
        title: 'No Draft Yet',
        description: 'Assign the draft to a client first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.origin + lastDraftLink);
      toast({ title: 'Link Copied', description: 'Draft link copied to clipboard.' });
    } catch {
      toast({ title: 'Copy Failed', description: 'Unable to copy link.', variant: 'destructive' });
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-2 ${className || ''}`}>
      <Button variant="default" onClick={() => setDialogOpen(true)}>
        Assign to Client
      </Button>
      <Button variant="secondary" onClick={handleCopyLink}>
        <Share2 className="h-4 w-4 mr-2" />
        Copy Last Draft Link
      </Button>

      <AdminAssignToClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default AdminProposalActions;
