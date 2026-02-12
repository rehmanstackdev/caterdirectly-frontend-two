
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminAssignToClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (email: string) => Promise<void>;
}

export const AdminAssignToClientDialog = ({
  open,
  onOpenChange,
  onAssign,
}: AdminAssignToClientDialogProps) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!email) return;
    setSubmitting(true);
    try {
      await onAssign(email.trim());
      onOpenChange(false);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Draft to Client</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="client-email">Client Email</Label>
            <Input
              id="client-email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-muted-foreground text-sm">
              The client must already have an account. The draft will appear in their Drafts.
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAssign} disabled={!email || submitting}>
            {submitting ? 'Assigning…' : 'Assign'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
