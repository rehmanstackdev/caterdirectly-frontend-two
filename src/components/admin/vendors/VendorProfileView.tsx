
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVendorProfile } from '@/hooks/admin/vendors/use-vendor-profile';
import { VendorProfileSkeleton } from './VendorProfileSkeleton';
import { VendorBasicInfo } from './VendorBasicInfo';
import { VendorBusinessDetails } from './VendorBusinessDetails';
import { VendorApplicationStatus } from './VendorApplicationStatus';
import { VendorServiceDetails } from './VendorServiceDetails';
import { VendorManagementInfo } from './VendorManagementInfo';
import { VendorBrandsAdmin } from './VendorBrandsAdmin';

interface VendorProfileViewProps {
  vendorId: string;
}

export function VendorProfileView({ vendorId }: VendorProfileViewProps) {
  const { vendor, loading, error, updateVendorAddress } = useVendorProfile(vendorId);

  if (loading) {
    return <VendorProfileSkeleton />;
  }

  if (error || !vendor) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p className="text-gray-500">
              {error || 'Vendor not found'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <VendorApplicationStatus vendor={vendor} />
      
      {/* Basic Information */}
      <VendorBasicInfo vendor={vendor} />
      
      {/* Business Details */}
      <VendorBusinessDetails vendor={vendor} updateVendorAddress={updateVendorAddress} />
      
      {/* Service Information */}
      <VendorServiceDetails vendor={vendor} />
      
      {/* Brands Management (Admin Only) */}
      <VendorBrandsAdmin vendorId={vendor.id} />
      
      {/* Management Information */}
      <VendorManagementInfo vendor={vendor} />
    </div>
  );
};
