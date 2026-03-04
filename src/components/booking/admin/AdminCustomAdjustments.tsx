
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { CustomAdjustment, AdjustmentMode, AdjustmentType } from '@/types/adjustments';
import { formatCurrency } from '@/lib/utils';
import { ServiceSelection } from '@/types/order';
import { useEnhancedDraftOrders } from '@/hooks/use-enhanced-draft-orders';


interface AdminCustomAdjustmentsProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  draftId?: string | null;
  adjustments: CustomAdjustment[];
  onChange: (next: CustomAdjustment[]) => void;
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  adminNotes?: string;
  onTaxExemptChange?: (exempt: boolean) => void;
  onServiceFeeWaivedChange?: (waived: boolean) => void;
  onAdminNotesChange?: (notes: string) => void;
}

const AdminCustomAdjustments = ({
  selectedServices,
  selectedItems,
  formData,
  draftId,
  adjustments,
  onChange,
  isTaxExempt = false,
  isServiceFeeWaived = false,
  adminNotes = '',
  onTaxExemptChange,
  onServiceFeeWaivedChange,
  onAdminNotesChange,
}: AdminCustomAdjustmentsProps) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<AdjustmentType>('fixed');
  const [mode, setMode] = useState<AdjustmentMode>('surcharge');
  const [value, setValue] = useState<number>(0);
  const [taxable, setTaxable] = useState<boolean>(true);
  const { autoSave, saveStatus, lastSaveTime } = useEnhancedDraftOrders();
  
  // Filter out delivery fees from adjustments (they're now handled separately)
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => !adj.label.includes('Delivery Fee'));
  }, [adjustments]);

  const addAdjustment = () => {
    if (!label.trim()) {
      toast.error('Please enter a label for the adjustment');
      return;
    }
    if (isNaN(Number(value))) {
      toast.error('Please enter a valid value');
      return;
    }

    const next: CustomAdjustment = {
      id: uuidv4(),
      label: label.trim(),
      type,
      mode,
      value: Number(value),
      taxable,
    };
    const updated = [...adjustments, next];
    onChange(updated);

    // autosave
    const currentDraftId = draftId || (() => { try { return localStorage.getItem('currentDraftId'); } catch { return null; } })();
    autoSave(selectedServices, selectedItems, formData, currentDraftId || undefined, updated);
    setLabel('');
    setValue(0);
    setMode('surcharge');
    setType('fixed');
    setTaxable(true);
    toast.success('Adjustment added');
  };

  const removeAdjustment = (id: string) => {
    const updated = adjustments.filter(a => a.id !== id);
    onChange(updated);
    const currentDraftId = draftId || (() => { try { return localStorage.getItem('currentDraftId'); } catch { return null; } })();
    autoSave(selectedServices, selectedItems, formData, currentDraftId || undefined, updated);
  };

  const footerNote = useMemo(() => {
    const parts = [
      saveStatus === 'saving' ? 'Saving…' : undefined,
      lastSaveTime ? `Last saved ${new Date(lastSaveTime).toLocaleTimeString()}` : undefined
    ].filter(Boolean);
    return parts.join(' — ');
  }, [saveStatus, lastSaveTime]);

  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin: Custom Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Add form */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2">
            <Label htmlFor="adj-label">Label</Label>
            <Input id="adj-label" placeholder="e.g., Rush fee, Discount, Credit" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="adj-type">Type</Label>
            <select
              id="adj-type"
              className="w-full border rounded h-10 px-2 bg-background text-foreground"
              value={type}
              onChange={e => setType(e.target.value as AdjustmentType)}
            >
              <option value="fixed">Fixed $</option>
              <option value="percentage">% of subtotal</option>
            </select>
          </div>
          <div>
            <Label htmlFor="adj-mode">Mode</Label>
            <select
              id="adj-mode"
              className="w-full border rounded h-10 px-2 bg-background text-foreground"
              value={mode}
              onChange={e => setMode(e.target.value as AdjustmentMode)}
            >
              <option value="surcharge">Surcharge</option>
              <option value="discount">Discount</option>
            </select>
          </div>
          <div>
            <Label htmlFor="adj-value">Value</Label>
            <Input
              id="adj-value"
              type="number"
              step="0.01"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              placeholder={type === 'percentage' ? 'e.g., 10 (%)' : 'e.g., 25.00 ($)'}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="adj-taxable" type="checkbox" checked={taxable} onChange={(e) => setTaxable(e.target.checked)} />
          <Label htmlFor="adj-taxable" className="cursor-pointer">Taxable</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={addAdjustment}>Add line item</Button>
        </div>

        <Separator />

        {/* List */}
        <div className="space-y-2">
          {filteredAdjustments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom line items added yet.</p>
          ) : (
            filteredAdjustments.map((a) => {
              const typeText = a.type === 'percentage' ? `${a.value}%` : formatCurrency(a.value);
              const sign = a.mode === 'discount' ? '-' : '+';
              return (
                <div key={a.id} className="flex items-center justify-between border rounded px-3 py-2 bg-card">
                  <div className="flex flex-col">
                    <span className="font-medium">{a.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {sign}{typeText} {a.taxable === false ? '(non-taxable)' : '(taxable)'}
                    </span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeAdjustment(a.id)}>Remove</Button>
                </div>
              );
            })
          )}
        </div>

        {footerNote && <p className="text-xs text-muted-foreground">{footerNote}</p>}
        </CardContent>
      </Card>
  );
};

export default AdminCustomAdjustments;

