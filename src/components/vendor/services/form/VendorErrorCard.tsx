
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VendorErrorCardProps {
  title?: string;
  description?: string;
}

const VendorErrorCard: React.FC<VendorErrorCardProps> = ({
  title = "Missing Vendor Information",
  description = "No vendor ID was provided. Please return to vendor management and try again."
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
          <p className="text-red-700">{description}</p>
        </div>
        <div className="mt-4">
          <a href="/admin/vendors" className="bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-md text-slate-800 inline-block">
            Return to Vendor Management
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorErrorCard;
