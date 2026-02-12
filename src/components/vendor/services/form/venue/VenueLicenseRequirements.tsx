import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LicenseType } from '@/types/service-types';

interface VenueLicenseRequirementsProps {
  licenseRequirements: LicenseType[];
  updateLicenseRequirements: (requirements: LicenseType[]) => void;
}

const LICENSE_OPTIONS: { value: LicenseType; label: string; description: string }[] = [
  {
    value: 'liquor_license',
    label: 'Liquor License',
    description: 'Required for serving alcoholic beverages'
  },
  {
    value: 'catering_permit',
    label: 'Catering Permit',
    description: 'Special permit for catering operations'
  },
  {
    value: 'food_handler_permit',
    label: 'Food Handler Permit',
    description: 'Certification for safe food handling practices'
  },
  {
    value: 'business_license',
    label: 'Business License',
    description: 'Valid local business operating license'
  },
  {
    value: 'health_department_permit',
    label: 'Health Department Permit',
    description: 'Health department approval for food service'
  }
];

const VenueLicenseRequirements: React.FC<VenueLicenseRequirementsProps> = ({
  licenseRequirements,
  updateLicenseRequirements
}) => {
  const handleLicenseToggle = (licenseType: LicenseType, checked: boolean) => {
    if (checked) {
      updateLicenseRequirements([...licenseRequirements, licenseType]);
    } else {
      updateLicenseRequirements(licenseRequirements.filter(req => req !== licenseType));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">License Requirements</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select licenses and permits that vendors must have to work at your venue
        </p>
      </div>
      
      <div className="space-y-3">
        {LICENSE_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-start space-x-3">
            <Checkbox
              id={option.value}
              checked={licenseRequirements.includes(option.value)}
              onCheckedChange={(checked) => 
                handleLicenseToggle(option.value, checked as boolean)
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
      
      {licenseRequirements.length === 0 && (
        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          No license requirements selected. Vendors will not need to meet specific licensing criteria.
        </p>
      )}
    </div>
  );
};

export default VenueLicenseRequirements;