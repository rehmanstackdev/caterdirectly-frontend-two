
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceType } from '@/types/service-types';
import BrandSelector from './BrandSelector';

interface ServiceBasicInfoProps {
  formData: {
    name: string;
    type: ServiceType;
    description: string;
    brandId?: string;
  };
  updateFormData: (data: Partial<ServiceBasicInfoProps['formData']>) => void;
  showErrors?: boolean;
  vendorId?: string;
}

const ServiceBasicInfo: React.FC<ServiceBasicInfoProps> = ({ formData, updateFormData, showErrors = false, vendorId }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">Service Name</Label>
          {showErrors && !formData.name && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>
        <Input
          id="name"
          placeholder="Enter your service name"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">
          Choose a descriptive name that clearly conveys what your service offers
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="service-type">Service Type</Label>
          {showErrors && !formData.type && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>
        <Select 
          value={formData.type} 
          onValueChange={(value) => updateFormData({ type: value as ServiceType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="catering">Catering</SelectItem>
            <SelectItem value="venues">Venues</SelectItem>
            <SelectItem value="party-rentals">Party Rentals</SelectItem>
            <SelectItem value="staff">Event Staff</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          The type of service determines where it appears in the marketplace
        </p>
      </div>

      {/* Ghost brand selection (optional) */}
      <div className="space-y-2">
        <BrandSelector
          vendorId={vendorId}
          value={formData.brandId}
          onChange={(brandId) => updateFormData({ brandId })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description</Label>
          {showErrors && !formData.description && (
            <span className="text-sm text-destructive">Required</span>
          )}
        </div>
        <Textarea
          id="description"
          placeholder="Describe your service in detail"
          rows={5}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">
          Provide a detailed description of what you offer, including any special features or benefits
        </p>
      </div>
    </div>
  );
};

export default ServiceBasicInfo;
