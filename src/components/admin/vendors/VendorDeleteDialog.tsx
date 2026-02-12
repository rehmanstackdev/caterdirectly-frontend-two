
import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';

interface VendorDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteServices: boolean) => void;
  vendorName: string;
  serviceCount: number;
}

export const VendorDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  vendorName,
  serviceCount
}: VendorDeleteDialogProps) => {
  const [deleteServices, setDeleteServices] = useState(false);

  const handleConfirm = () => {
    onConfirm(deleteServices);
    onClose();
    setDeleteServices(false);
  };

  const handleCancel = () => {
    onClose();
    setDeleteServices(false);
  };

  const handleCheckboxChange = (checked: boolean | "indeterminate") => {
    setDeleteServices(checked === true);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{vendorName}</strong>? 
              This action cannot be undone.
            </p>
            
            {serviceCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800 mb-2">
                  This vendor has <strong>{serviceCount}</strong> service{serviceCount !== 1 ? 's' : ''}.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="delete-services"
                    checked={deleteServices}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <label htmlFor="delete-services" className="text-sm text-yellow-800">
                    Also delete all associated services
                  </label>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  If unchecked, services will be preserved but marked as orphaned.
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Any existing orders will be preserved but the vendor reference will be removed.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Vendor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
