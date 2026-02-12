

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginAlertsProps {
  authError: string | null;
}

export const LoginAlerts = ({ authError }: LoginAlertsProps) => {
  return (
    <>
      {authError && (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {authError}
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="mt-4 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          This login is for admin users only. If you're a vendor, please use the vendor login.
        </AlertDescription>
      </Alert>
    </>
  );
};
