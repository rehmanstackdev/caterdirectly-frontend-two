

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface VendorManagementInfoProps {
  vendor: any;
}

export const VendorManagementInfo = ({ vendor }: VendorManagementInfoProps) => {
  console.log(JSON.stringify(vendor));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Management & Administration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Managed Status</h4>
            <Badge variant={vendor.is_managed ? "default" : "outline"}>
              {vendor.is_managed ? "Platform Managed" : "Self-Managed"}
            </Badge>
            <p className="text-xs text-gray-500 mt-1">
              {vendor.is_managed 
                ? "Platform handles pricing and customer interactions" 
                : "Vendor manages their own pricing and customers"
              }
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Commission Rate</h4>
            <p className="text-2xl font-bold text-green-600">
              {(() => {
                const rate = vendor.commission_rate ?? vendor.commissionRate ?? 0;
                // Convert decimal to percentage for display (0.0519 → 5.19%)
                // If value is <= 1, it's decimal format, convert to percentage
                // If value > 1, it's already percentage format
                if (rate === 0 || rate === null || rate === undefined) {
                  return '0.00';
                }
                return rate <= 1 ? (rate * 100).toFixed(2) : rate.toFixed(2);
              })()}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Platform commission rate</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Account Status</h4>
            {(() => {
              const stripeAccountId = vendor.stripeConnectAccountId || vendor.stripe_connect_account_id;
              const isApproved = !!stripeAccountId;
              return (
                <Badge 
                  variant={isApproved ? 'default' : 'secondary'}
                  className={
                    isApproved 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                  }
                >
                  {isApproved ? 'Approved' : 'Pending'}
                </Badge>
              );
            })()}
          </div>
        </div>
        
        {/* Timeline Information */}
        <Separator />
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Application Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Application Submitted</p>
              <p className="text-sm text-blue-700">
                {vendor.user?.createdAt ? 
                  `${new Date(vendor.user.createdAt).toLocaleDateString()} at ${new Date(vendor.user.createdAt).toLocaleTimeString()}` 
                  : 'Not available'}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-green-900">Last Updated</p>
              <p className="text-sm text-green-700">
                {vendor.user?.updatedAt ? 
                  `${new Date(vendor.user.updatedAt).toLocaleDateString()} at ${new Date(vendor.user.updatedAt).toLocaleTimeString()}` 
                  : 'Not available'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Admin Feedback Section */}
        {vendor.admin_feedback && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Administrative Notes</h4>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-amber-800 text-sm whitespace-pre-wrap">
                  {vendor.admin_feedback}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Additional Vendor Metadata */}
        <Separator />
        <div>
          <h4 className="font-medium text-gray-900 mb-3">System Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Vendor ID:</span>
              <p className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded">
                {vendor.id}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Stripe Connect Account ID:</span>
              <p className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded break-all">
                {vendor.stripeConnectAccountId || vendor.stripe_connect_account_id || 'Not configured'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Name Change Propagation:</span>
              <p className="mt-1">
                <Badge variant={vendor.propagate_name_changes ? "default" : "outline"}>
                  {vendor.propagate_name_changes ? "Enabled" : "Disabled"}
                </Badge>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Updates to company name will {vendor.propagate_name_changes ? 'automatically update' : 'not affect'} existing services
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
