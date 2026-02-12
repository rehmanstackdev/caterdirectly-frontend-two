import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VendorPolicy } from '@/types/service-types';
import { AlertCircle, Users, Lock, UserCheck } from 'lucide-react';

interface VenueVendorPolicyProps {
  vendorPolicy: VendorPolicy;
  updateVendorPolicy: (policy: VendorPolicy) => void;
}

const VENDOR_POLICY_OPTIONS: { 
  value: VendorPolicy; 
  label: string; 
  description: string;
  icon: React.ReactNode;
  impact: string;
}[] = [
  {
    value: 'platform_open',
    label: 'Accept Any Platform Vendor',
    description: 'Allow any approved vendor from our platform to work at your venue',
    icon: <Users className="h-5 w-5 text-green-600" />,
    impact: 'Maximum visibility and booking opportunities'
  },
  {
    value: 'preferred_only',
    label: 'Preferred Vendors Only',
    description: 'Only allow vendors from your pre-approved preferred list',
    icon: <Lock className="h-5 w-5 text-amber-600" />,
    impact: 'Limited to your selected vendors only'
  },
  {
    value: 'hybrid',
    label: 'Hybrid Approach',
    description: 'Preferred vendors get priority, but others can request approval',
    icon: <UserCheck className="h-5 w-5 text-blue-600" />,
    impact: 'Balance between control and opportunities'
  }
];

const VenueVendorPolicy: React.FC<VenueVendorPolicyProps> = ({
  vendorPolicy,
  updateVendorPolicy
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Vendor Policy</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how you want to manage vendor access to your venue
        </p>
      </div>
      
      <RadioGroup
        value={vendorPolicy}
        onValueChange={(value) => updateVendorPolicy(value as VendorPolicy)}
        className="space-y-4"
      >
        {VENDOR_POLICY_OPTIONS.map((option) => (
          <div 
            key={option.value} 
            className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
              vendorPolicy === option.value 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {option.icon}
                <Label 
                  htmlFor={option.value}
                  className="text-sm font-medium cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>{option.impact}</span>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
      
      {vendorPolicy === 'preferred_only' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Limited Visibility</p>
              <p className="text-amber-700">
                Your venue will only appear in search results when users have selected 
                vendors from your preferred list. This may reduce booking opportunities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenueVendorPolicy;