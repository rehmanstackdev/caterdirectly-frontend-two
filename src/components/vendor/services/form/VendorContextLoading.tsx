
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';

const VendorContextLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Loading Vendor Context
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#F07712]" />
            <p className="text-sm text-gray-600">
              Setting up your vendor account...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorContextLoading;
