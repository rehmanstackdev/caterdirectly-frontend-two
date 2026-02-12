import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface DraftRenameDialogProps {
  draftId: string;
  currentName: string;
  onRename: (draftId: string, newName: string) => Promise<boolean>;
  userRole?: 'admin' | 'vendor' | 'host' | 'event-host';
}

export const DraftRenameDialog = ({
  draftId,
  currentName,
  onRename,
  userRole = 'host'
}: DraftRenameDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);

  // Only show rename option for admin and vendor users
  const canRename = userRole === 'admin' || userRole === 'vendor';

  if (!canRename) return null;

  const handleRename = async () => {
    const trimmedName = newName.trim();
    
    if (!trimmedName) {
      toast.error('Draft name cannot be empty');
      return;
    }

    if (trimmedName === currentName) {
      setOpen(false);
      return;
    }

    setIsRenaming(true);
    try {
      const success = await onRename(draftId, trimmedName);
      if (success) {
        setOpen(false);
        toast.success('Draft renamed successfully');
      }
    } catch (error) {
      console.error('Rename failed:', error);
      toast.error('Failed to rename draft');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRename();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            setNewName(currentName);
            setOpen(true);
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Draft</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="draft-name">Draft Name</Label>
            <Input
              id="draft-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new draft name..."
              className="mt-1"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRename}
              disabled={isRenaming || !newName.trim()}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};