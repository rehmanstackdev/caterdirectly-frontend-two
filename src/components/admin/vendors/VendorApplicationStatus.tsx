

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VendorApplicationStatusProps {
  vendor: any;
}

export const VendorApplicationStatus = ({ vendor }: VendorApplicationStatusProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'active':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
            <Badge className={getStatusColor(vendor.vendor_status)}>
              {vendor.vendor_status?.charAt(0).toUpperCase() + vendor.vendor_status?.slice(1)}
            </Badge>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Application Submitted</h4>
            <p className="text-gray-600">
              {vendor.user?.createdAt ? 
                `${new Date(vendor.user.createdAt).toLocaleDateString()} at ${new Date(vendor.user.createdAt).toLocaleTimeString()}` 
                : 'Not available'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
            <p className="text-gray-600">
              {vendor.user?.updatedAt ? 
                `${new Date(vendor.user.updatedAt).toLocaleDateString()} at ${new Date(vendor.user.updatedAt).toLocaleTimeString()}` 
                : 'Not available'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
