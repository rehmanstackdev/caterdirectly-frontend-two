
import React from 'react';
import { ServiceAdditions } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface ServiceAdditionsFormProps {
  serviceAdditions: ServiceAdditions;
  onUpdate: (additions: ServiceAdditions) => void;
}

const ServiceAdditionsForm: React.FC<ServiceAdditionsFormProps> = ({
  serviceAdditions,
  onUpdate
}) => {
  // Initialize with default values if not provided
  const additions = React.useMemo(() => ({
    providesUtensils: serviceAdditions?.providesUtensils ?? false,
    utensilsFee: serviceAdditions?.utensilsFee ?? undefined,
    providesPlates: serviceAdditions?.providesPlates ?? false,
    platesFee: serviceAdditions?.platesFee ?? undefined,
    providesNapkins: serviceAdditions?.providesNapkins ?? false,
    napkinsFee: serviceAdditions?.napkinsFee ?? undefined,
    providesServingUtensils: serviceAdditions?.providesServingUtensils ?? false,
    servingUtensilsFee: serviceAdditions?.servingUtensilsFee ?? undefined,
    providesLabels: true // Auto-included, always true
  }), [serviceAdditions]);

  const handleToggleOption = (option: keyof ServiceAdditions, checked: boolean) => {
    if (typeof checked !== 'boolean') return;
    
    onUpdate({
      ...additions,
      [option]: checked
    });
  };

  const handleFeeChange = (option: keyof ServiceAdditions, value: number | undefined) => {
    onUpdate({
      ...additions,
      [option]: value
    });
  };

  // Currency formatting helpers
  const formatCurrencyDisplay = (value: number | undefined) => {
    if (value === undefined || value === null || isNaN(Number(value)) || Number(value) <= 0) return '';
    return `$${(Math.round(Number(value) * 100) / 100).toFixed(2)}`;
  };

  const parseCurrencyInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const num = parseFloat(cleaned);
    return isNaN(num) || num <= 0 ? undefined : Math.max(0, num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tableware & Service Supplies</CardTitle>
        <p className="text-sm text-muted-foreground">Select additional supplies you provide (per person fees)</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Eating Supplies */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Eating Supplies</h4>
            <p className="text-xs text-muted-foreground">Utensils and napkins for guests</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="provides-utensils"
                checked={additions.providesUtensils}
                onCheckedChange={(checked) => handleToggleOption('providesUtensils', checked === true)}
              />
              <Label htmlFor="provides-utensils">Eating Utensils (forks, knives, spoons)</Label>
            </div>
            {additions.providesUtensils && (
              <div className="w-28">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="$0.00"
                  value={formatCurrencyDisplay(additions.utensilsFee)}
                  onChange={(e) => handleFeeChange('utensilsFee', parseCurrencyInput(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="provides-napkins"
                checked={additions.providesNapkins}
                onCheckedChange={(checked) => handleToggleOption('providesNapkins', checked === true)}
              />
              <Label htmlFor="provides-napkins">Napkins</Label>
            </div>
            {additions.providesNapkins && (
              <div className="w-28">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="$0.00"
                  value={formatCurrencyDisplay(additions.napkinsFee)}
                  onChange={(e) => handleFeeChange('napkinsFee', parseCurrencyInput(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Service Supplies */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Service Supplies</h4>
            <p className="text-xs text-muted-foreground">Plates and serving equipment</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="provides-plates"
                checked={additions.providesPlates}
                onCheckedChange={(checked) => handleToggleOption('providesPlates', checked === true)}
              />
              <Label htmlFor="provides-plates">Plates & Bowls</Label>
            </div>
            {additions.providesPlates && (
              <div className="w-28">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="$0.00"
                  value={formatCurrencyDisplay(additions.platesFee)}
                  onChange={(e) => handleFeeChange('platesFee', parseCurrencyInput(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="provides-serving-utensils"
                checked={additions.providesServingUtensils}
                onCheckedChange={(checked) => handleToggleOption('providesServingUtensils', checked === true)}
              />
              <Label htmlFor="provides-serving-utensils">Serving Utensils</Label>
            </div>
            {additions.providesServingUtensils && (
              <div className="w-28">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="$0.00"
                  value={formatCurrencyDisplay(additions.servingUtensilsFee)}
                  onChange={(e) => handleFeeChange('servingUtensilsFee', parseCurrencyInput(e.target.value))}
                />
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Auto-included items */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Included with Every Order</h4>
          <p className="text-xs text-muted-foreground">✓ Item labels (automatically provided)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceAdditionsForm;
