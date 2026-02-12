import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { OrderFinancialBreakdown } from '@/utils/financial-calculations';
import { Badge } from '@/components/ui/badge';

interface VendorEarningsCardProps {
  breakdown: OrderFinancialBreakdown;
  isServiceFeeWaived?: boolean;
  isTaxExempt?: boolean;
}

const VendorEarningsCard: React.FC<VendorEarningsCardProps> = ({
  breakdown,
  isServiceFeeWaived = false,
  isTaxExempt = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Financial Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Total Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Customer Charges
            <Badge variant="outline" className="text-xs">Total Paid</Badge>
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                Service Fee ({(breakdown.serviceFeeRate * 100).toFixed(1)}%)
                <span className="text-xs text-green-600">✓ Charged to client</span>
              </span>
              <span className="font-medium">
                {formatCurrency(breakdown.serviceFee)}
                {isServiceFeeWaived && (
                  <Badge variant="secondary" className="ml-2 text-xs">WAIVED</Badge>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                Tax ({(breakdown.taxRate * 100).toFixed(2)}%)
                <span className="text-xs text-green-600">✓ Charged to client</span>
              </span>
              <span className="font-medium">
                {formatCurrency(breakdown.tax)}
                {isTaxExempt && (
                  <Badge variant="secondary" className="ml-2 text-xs">EXEMPT</Badge>
                )}
              </span>
            </div>
            
            {breakdown.deliveryFee > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  Delivery Fee
                  <span className="text-xs text-green-600">✓ Charged to client</span>
                </span>
                <span className="font-medium">{formatCurrency(breakdown.deliveryFee)}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-base font-semibold">
            <span>Total Charged to Client</span>
            <span className="text-primary">{formatCurrency(breakdown.total)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Vendor Earnings Section */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            Your Earnings Breakdown
            <Badge variant="default" className="text-xs">Net Payout</Badge>
          </h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Subtotal</span>
              <span className="font-medium">{formatCurrency(breakdown.subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-red-600">
              <span className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Platform Commission ({(breakdown.commissionRate * 100).toFixed(0)}%)
              </span>
              <span className="font-medium">-{formatCurrency(breakdown.commission)}</span>
            </div>
            
            <div className="flex justify-between text-red-600">
              <span className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                Tax Withheld (paid to government)
              </span>
              <span className="font-medium">-{formatCurrency(breakdown.taxWithheld)}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <span className="font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Net Payout
            </span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(breakdown.vendorShare)}
            </span>
          </div>
        </div>

        {/* Informational Alert */}
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Service fee and delivery charges are added to the customer's total and do not affect your earnings. 
            Tax is collected from the customer but withheld from your payout and remitted to the government on your behalf.
          </AlertDescription>
        </Alert>

      </CardContent>
    </Card>
  );
};

export default VendorEarningsCard;
