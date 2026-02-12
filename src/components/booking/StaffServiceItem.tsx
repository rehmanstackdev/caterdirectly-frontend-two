import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Clock, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StaffServiceItemProps {
  item: any;
  quantity: number;
  duration: number; // hours
  onQuantityChange: (quantity: number) => void;
  onDurationChange: (duration: number) => void;
}

const StaffServiceItem = ({
  item,
  quantity,
  duration,
  onQuantityChange,
  onDurationChange
}: StaffServiceItemProps) => {
  const itemName = item.name || item.title || item.service || 'Staff Service';
  const itemPrice = item.hourlyRate || parseFloat((item.price || item.rate || '0').toString().replace(/[^0-9.]/g, '')) || 0;
  const itemDescription = item.description || item.details || '';
  
  // Calculate total cost: quantity × duration × hourly rate
  const totalCost = quantity * duration * itemPrice;

  const minHours: number = Math.max(1, parseInt(item.minimumHours || item.minHours || '1'));

  const handleQuantityChange = (increment: boolean) => {
    const newQuantity = increment ? quantity + 1 : Math.max(0, quantity - 1);
    onQuantityChange(newQuantity);
    // If we just increased quantity from 0, ensure duration meets minimum hours
    if (increment && quantity === 0 && (duration === 0 || duration < minHours)) {
      onDurationChange(minHours);
    }
  };

  const handleDurationChange = (increment: boolean) => {
    if (quantity === 0) {
      const newDuration = increment ? duration + 1 : Math.max(0, duration - 1);
      onDurationChange(newDuration);
      return;
    }
    const candidate = increment ? duration + 1 : duration - 1;
    const newDuration = Math.max(minHours, candidate);
    onDurationChange(newDuration);
  };

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clamped = Math.max(0, value);
    onQuantityChange(clamped);
    if (clamped > 0 && duration < minHours) {
      onDurationChange(minHours);
    }
  };

  const handleDurationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const clamped = quantity === 0 ? Math.max(0, value) : Math.max(minHours, value);
    onDurationChange(clamped);
  };
  
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white">
      {/* Staff Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm sm:text-base">
          {itemName}
        </h4>
        {itemDescription && (
          <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
            {itemDescription}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-gray-700">
            {formatPrice(itemPrice)}/hour
          </span>
          {minHours > 1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              Min {minHours} hrs
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:items-end">
        {/* Quantity Control */}
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600 min-w-[30px]">Staff:</span>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={quantity <= 0 ? 'inline-flex cursor-not-allowed' : 'inline-flex'}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(false)}
                      disabled={quantity <= 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {quantity <= 0 && (
                  <TooltipContent side="top">Cannot go below 0</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityInputChange}
              onFocus={(e) => e.target.select()}
              className="w-16 h-8 text-center text-sm"
              min="0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Duration Control */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-600 min-w-[30px]">Hours:</span>
          {minHours > 1 && (
            <span className="text-[10px] text-gray-500">(min {minHours})</span>
          )}
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={(quantity > 0 ? duration <= minHours : duration <= 0) ? 'inline-flex cursor-not-allowed' : 'inline-flex'}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDurationChange(false)}
                      disabled={quantity > 0 ? duration <= minHours : duration <= 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {(quantity > 0 ? duration <= minHours : duration <= 0) && (
                  <TooltipContent side="top">
                    {quantity > 0 ? `Minimum ${minHours} hrs` : 'Hours can be 0 until staff is added'}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Input
              type="number"
              value={duration}
              onChange={handleDurationInputChange}
              onFocus={(e) => e.target.select()}
              className="w-16 h-8 text-center text-sm"
              min={quantity > 0 ? minHours : 0}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDurationChange(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {minHours > 1 && (
          <div className="text-xs text-gray-500">
            {quantity > 0 ? `Minimum ${minHours} hours per booking` : `Minimum ${minHours} hours will apply once staff is added`}
          </div>
        )}

        {/* Total Cost Display */}
        {quantity > 0 && duration > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {quantity} staff × {duration} hrs × {formatPrice(itemPrice)}
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {formatPrice(totalCost)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffServiceItem;