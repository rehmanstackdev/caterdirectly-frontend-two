import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useVendorBrandsAdmin } from '@/hooks/admin/vendors/use-vendor-brands-admin';

interface VendorBrandsAdminProps {
  vendorId: string;
}

export const VendorBrandsAdmin = ({ vendorId }: VendorBrandsAdminProps) => {
  const { brands, loading, createBrand, updateStatus, removeBrand } = useVendorBrandsAdmin(vendorId);
  const [form, setForm] = useState({ brand_name: '', brand_logo: '', brand_website: '', brand_description: '' });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Brands (Ghost Brands)</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Brand Name</Label>
          <Input value={form.brand_name} onChange={(e) => setForm({ ...form, brand_name: e.target.value })} placeholder="The Dessert Store" />
        </div>
        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input value={form.brand_logo} onChange={(e) => setForm({ ...form, brand_logo: e.target.value })} placeholder="https://..." />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={form.brand_website} onChange={(e) => setForm({ ...form, brand_website: e.target.value })} placeholder="https://..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <Input value={form.brand_description} onChange={(e) => setForm({ ...form, brand_description: e.target.value })} placeholder="Short description" />
        </div>
      </div>

      <div className="mt-4">
        <Button
          onClick={() => createBrand({
            brand_name: form.brand_name,
            brand_logo: form.brand_logo || undefined,
            brand_website: form.brand_website || undefined,
            brand_description: form.brand_description || undefined,
          })}
          disabled={!form.brand_name}
        >
          Create Brand (Admin)
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {brands.map((b) => (
          <div key={b.id} className="flex items-center justify-between border rounded-md p-3">
            <div>
              <div className="font-medium">{b.brand_name}</div>
              <div className="text-sm text-muted-foreground">{b.brand_website || ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={b.status === 'approved' ? 'default' : b.status === 'pending' ? 'secondary' : 'destructive'}>
                {b.status}
              </Badge>
              {b.status !== 'approved' && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'approved')}>Approve</Button>
              )}
              {b.status === 'approved' && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'rejected')}>Reject</Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => removeBrand(b.id)}>Delete</Button>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="text-sm text-muted-foreground">No brands yet.</div>
        )}
      </div>
    </Card>
  );
};
