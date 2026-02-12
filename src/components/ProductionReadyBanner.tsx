import { FC } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ProductionReadyBanner = () => {
  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const needsProduction = [
    'Update Stripe keys to production values',
    'Configure production email service (Gmail API or Resend)',
    'Set up proper domain and SSL certificates',
    'Configure production Supabase URLs',
    
    'Set up monitoring and error tracking'
  ];

  return (
    <Alert className="mb-4 bg-orange-50 border-orange-200">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        <div className="font-semibold mb-2">Development Mode - Production Checklist:</div>
        <ul className="text-sm space-y-1">
          {needsProduction.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default ProductionReadyBanner;