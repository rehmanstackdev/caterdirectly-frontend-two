import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  memberName: string;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  memberName,
  loading,
  open,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{memberName}</strong> from your team? This action cannot be undone and they will lose all access to the vendor panel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
