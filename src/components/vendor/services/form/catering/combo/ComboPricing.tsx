
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ComboPricingProps {
  price: number;
  onPriceChange: (value: number) => void;
  category: string;
  categories: string[];
  onCategoryChange: (value: string) => void;
}

const ComboPricing: React.FC<ComboPricingProps> = ({
  price,
  onPriceChange,
  category,
  categories,
  onCategoryChange
}) => {
  return (
    <div className="space-y-6">
      {/* Base Price */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 mb-1">
          <Label htmlFor="price">Base Price ($)*</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Base price for the combo. Items marked with additional price will add to this base price.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <DollarSign className="h-4 w-4" />
          </span>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            required
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Menu Category</Label>
        <select
          id="category"
          value={category || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-2 border rounded mt-1"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ComboPricing;
