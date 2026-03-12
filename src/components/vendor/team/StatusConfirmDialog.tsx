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

interface StatusConfirmDialogProps {
  memberName: string;
  currentStatus: string;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const StatusConfirmDialog: React.FC<StatusConfirmDialogProps> = ({
  memberName,
  currentStatus,
  loading,
  open,
  onOpenChange,
  onConfirm,
}) => {
  const isActive = currentStatus === 'active';

  return (
    <AlertDialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Deactivate' : 'Activate'} Team Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive
              ? `Are you sure you want to deactivate ${memberName}? They will lose access to the vendor panel until reactivated.`
              : `Are you sure you want to activate ${memberName}? They will regain access to the vendor panel.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? (isActive ? 'Deactivating...' : 'Activating...') : (isActive ? 'Deactivate' : 'Activate')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default StatusConfirmDialog;
