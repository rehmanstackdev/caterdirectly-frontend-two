
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info, DollarSign } from 'lucide-react';

interface CateringMinimumOrderProps {
  minimumOrderAmount?: number;
  onMinOrderChange: (value: number) => void;
}

const CateringMinimumOrder: React.FC<CateringMinimumOrderProps> = ({
  minimumOrderAmount,
  onMinOrderChange
}) => {
  // Format currency for display (whole numbers only)
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Parse currency input back to number (whole numbers only)
  const parseCurrencyInput = (value: string): number => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return parseInt(numericValue) || 0;
  };

  const handleMinOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseCurrencyInput(e.target.value);
    onMinOrderChange(isNaN(value) ? 0 : value);
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <Label htmlFor="min-order" className="block">Minimum Order Amount ($)</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">The minimum total order value required. This applies to the entire order, not per item.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-sm text-gray-500 mb-2">Minimum total order value required for this service (applies to entire order, not per person)</p>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          <DollarSign className="h-4 w-4" />
        </span>
        <Input
          id="min-order"
          type="text"
          className="pl-8"
          placeholder="0"
          value={formatCurrency(minimumOrderAmount).replace('$', '')}
          onChange={handleMinOrderChange}
        />
      </div>
    </div>
  );
};

export default CateringMinimumOrder;
