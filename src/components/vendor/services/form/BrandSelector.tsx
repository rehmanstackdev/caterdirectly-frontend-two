import React from 'react';
import { useVendorBrands } from '@/hooks/vendor/use-vendor-brands';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface BrandSelectorProps {
  vendorId?: string;
  value?: string;
  onChange: (brandId?: string) => void;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ vendorId, value, onChange }) => {
  const { brands } = useVendorBrands(vendorId);

  if (!vendorId) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="brand">Brand (optional)</Label>
      </div>
      <Select value={value || 'primary'} onValueChange={(val) => onChange(val === 'primary' ? undefined : val)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a brand (ghost brand)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="primary">Primary brand</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.id}>{b.brand_name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">Choose a ghost brand; orders still route to the same vendor.</p>
    </div>
  );
};

export default BrandSelector;
