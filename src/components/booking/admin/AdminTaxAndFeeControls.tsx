import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, Receipt, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminTaxAndFeeControlsProps {
  isTaxExempt: boolean;
  isServiceFeeWaived: boolean;
  adminNotes?: string;
  onTaxExemptChange: (exempt: boolean) => void;
  onServiceFeeWaivedChange: (waived: boolean) => void;
  onAdminNotesChange?: (notes: string) => void;
  className?: string;
}

const AdminTaxAndFeeControls = ({
  isTaxExempt,
  isServiceFeeWaived,
  adminNotes = '',
  onTaxExemptChange,
  onServiceFeeWaivedChange,
  onAdminNotesChange,
  className = "",
}: AdminTaxAndFeeControlsProps) => {

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-800">Admin: Tax & Fee Controls</h3>
      </div>
      <div className="flex items-center gap-1 text-xs text-amber-700 mb-4">
        <Info className="h-3 w-3" />
        <span>These controls affect final billing and calculations</span>
      </div>
      
      <div className="space-y-4">
        {/* Tax Exemption Control */}
        <div className="flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-background/50">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-amber-600" />
            <div>
              <Label htmlFor="tax-exempt" className="text-sm font-medium">
                Tax Exempt Status
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mark this order/proposal as tax exempt
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isTaxExempt && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">EXEMPT</Badge>}
            <Switch 
              id="tax-exempt"
              checked={isTaxExempt}
              onCheckedChange={onTaxExemptChange}
            />
          </div>
        </div>

        {/* Service Fee Waiver Control */}
        <div className="flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-background/50">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-amber-600" />
            <div>
              <Label htmlFor="service-fee-waived" className="text-sm font-medium">
                Waive Service Fee
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Remove service fee for this customer
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isServiceFeeWaived && <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">WAIVED</Badge>}
            <Switch 
              id="service-fee-waived"
              checked={isServiceFeeWaived}
              onCheckedChange={onServiceFeeWaivedChange}
            />
          </div>
        </div>

        {/* Admin Notes */}
        {onAdminNotesChange && (
          <div className="space-y-2">
            <Label htmlFor="admin-notes" className="text-sm font-medium">
              Admin Override Notes (Internal)
            </Label>
            <Textarea
              id="admin-notes"
              placeholder="Reason for tax exemption or fee waiver..."
              value={adminNotes}
              onChange={(e) => onAdminNotesChange(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>
        )}

        {/* Visual Summary */}
        {(isTaxExempt || isServiceFeeWaived) && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Active Overrides</span>
            </div>
            <div className="space-y-1">
              {isTaxExempt && (
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Tax exempt - No tax will be charged
                </div>
              )}
              {isServiceFeeWaived && (
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Service fee waived - Fee will be crossed out
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminTaxAndFeeControls;