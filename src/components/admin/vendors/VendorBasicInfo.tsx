

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VendorBasicInfoProps {
  vendor: any;
}

export const VendorBasicInfo = ({ vendor }: VendorBasicInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Company Name</h4>
            <p className="text-gray-600">{vendor.business_name}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Business Type</h4>
            <Badge variant="outline" className="capitalize">
              {vendor.service_types?.[0]?.replace('_', ' ') || 'Not specified'}
            </Badge>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Email</h4>
            <p className="text-gray-600">{vendor.user?.email}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
            <p className="text-gray-600">{vendor.phone || 'Not provided'}</p>
          </div>
          
          {vendor.website && (
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-2">Website</h4>
              <a 
                href={vendor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {vendor.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
