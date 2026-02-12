import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InsuranceType } from '@/types/service-types';

interface VenueInsuranceRequirementsProps {
  insuranceRequirements: InsuranceType[];
  updateInsuranceRequirements: (requirements: InsuranceType[]) => void;
}

const INSURANCE_OPTIONS: { value: InsuranceType; label: string; description: string }[] = [
  {
    value: 'general_liability',
    label: 'General Liability Insurance',
    description: 'Coverage for bodily injury and property damage claims'
  },
  {
    value: 'product_liability',
    label: 'Product Liability Insurance',
    description: 'Coverage for damages caused by food products'
  },
  {
    value: 'professional_liability',
    label: 'Professional Liability Insurance',
    description: 'Coverage for professional service errors'
  },
  {
    value: 'property_insurance',
    label: 'Property Insurance',
    description: 'Coverage for damage to venue property'
  },
  {
    value: 'workers_compensation',
    label: 'Workers Compensation',
    description: 'Coverage for vendor employee injuries'
  }
];

const VenueInsuranceRequirements: React.FC<VenueInsuranceRequirementsProps> = ({
  insuranceRequirements,
  updateInsuranceRequirements
}) => {
  const handleInsuranceToggle = (insuranceType: InsuranceType, checked: boolean) => {
    if (checked) {
      updateInsuranceRequirements([...insuranceRequirements, insuranceType]);
    } else {
      updateInsuranceRequirements(insuranceRequirements.filter(req => req !== insuranceType));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Insurance Requirements</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select insurance policies that vendors must have to work at your venue
        </p>
      </div>
      
      <div className="space-y-3">
        {INSURANCE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-start space-x-3">
            <Checkbox
              id={option.value}
              checked={insuranceRequirements.includes(option.value)}
              onCheckedChange={(checked) => 
                handleInsuranceToggle(option.value, checked as boolean)
              }
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor={option.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option.label}
              </Label>
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {insuranceRequirements.length === 0 && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          No insurance requirements selected. Vendors will not need to meet specific insurance criteria.
        </p>
      )}
    </div>
  );
};

export default VenueInsuranceRequirements;