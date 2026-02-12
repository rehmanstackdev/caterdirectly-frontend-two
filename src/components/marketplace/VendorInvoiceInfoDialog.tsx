import { FC, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface VendorInvoiceInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDontShowAgain: (checked: boolean) => void;
}

export function VendorInvoiceInfoDialog({ 
  open, 
  onOpenChange,
  onDontShowAgain 
}: VendorInvoiceInfoDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleContinue = () => {
    if (dontShowAgain) {
      onDontShowAgain(true);
    }
    onOpenChange(false);
  };

  const handleCheckboxChange = (checked: boolean | 'indeterminate') => {
    setDontShowAgain(checked === true);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vendor Invoice Mode</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              In invoice mode, you can select from your own services to create customized invoices for your clients.
            </p>
            <p>
              This ensures you only propose services you can fulfill directly, maintaining quality and reliability for your clients.
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox 
                id="dont-show-again"
                checked={dontShowAgain}
                onCheckedChange={handleCheckboxChange}
              />
              <label 
                htmlFor="dont-show-again" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Don't show this again
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleContinue}>
            Got it
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
