
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VendorServiceDetailsProps {
  vendor: any;
}

export function VendorServiceDetails({ vendor }: VendorServiceDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Service Types</h4>
            <div className="flex flex-wrap gap-2">
              {vendor.service_types?.map((type: string, index: number) => (
                <Badge key={index} variant="secondary" className="capitalize">
                  {type.replace('_', ' ')}
                </Badge>
              )) || <span className="text-gray-500">No service types specified</span>}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Service Coverage</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Service Radius:</span>
                <span className="text-sm font-medium">
                  {vendor.service_radius ? `${vendor.service_radius} miles` : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Coverage Area:</span>
                <span className="text-sm font-medium">
                  {vendor.city && vendor.state ? `${vendor.city}, ${vendor.state}` : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Classification */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Business Classification</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-500">Business Type:</span>
              <p className="font-medium capitalize">
                {vendor.business_type?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">EIN/TIN:</span>
              <p className="font-medium">
                {vendor.ein_tin || 'Not provided'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Registration Date:</span>
              <p className="font-medium">
                {new Date(vendor.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Complete Address Information */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Complete Business Address</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            {vendor.address ? (
              <div className="space-y-1">
                <p className="font-medium">{vendor.address}</p>
                <p>
                  {vendor.city}{vendor.city && vendor.state && ', '}{vendor.state} {vendor.zip_code}
                </p>
                {vendor.website && (
                  <p className="text-sm">
                    Website: <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{vendor.website}</a>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">Complete address not provided</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
