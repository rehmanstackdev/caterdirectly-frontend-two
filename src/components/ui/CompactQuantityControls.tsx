import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface CompactQuantityControlsProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  minQuantity?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  label?: string;
}

const CompactQuantityControls = ({
  quantity,
  onQuantityChange,
  minQuantity = 0,
  disabled = false,
  size = 'sm',
  className = "",
  label
}: CompactQuantityControlsProps) => {
  const currentQty = quantity;
  const minQty = minQuantity;

  const decrement = () => {
    if (disabled) return;
    if (currentQty <= 0) return onQuantityChange(0);
    if (minQty > 0 && currentQty <= minQty) return onQuantityChange(0);
    return onQuantityChange(Math.max(0, currentQty - 1));
  };

  const increment = () => {
    if (disabled) return;
    if (currentQty === 0 && minQty > 1) return onQuantityChange(minQty);
    return onQuantityChange(currentQty + 1);
  };

  const onInput = (value: string) => {
    if (disabled) return;
    const numValue = parseInt(value) || 0;
    if (numValue <= 0) return onQuantityChange(0);
    if (minQty > 0 && numValue < minQty) return onQuantityChange(minQty);
    return onQuantityChange(numValue);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const sizeClasses = size === 'md' ? {
    buttonSize: "h-8 w-8",
    inputSize: "w-16 h-8",
    iconSize: "h-4 w-4"
  } : {
    buttonSize: "h-7 w-7 sm:h-8 sm:w-8",
    inputSize: "w-14 sm:w-16 min-w-[3.5rem] sm:min-w-[4rem] h-7 sm:h-8",
    iconSize: "h-3 w-3"
  };

  return (
    <div className={`flex items-center space-x-2 ${className} ${disabled ? 'opacity-50' : ''}`}>
      {label && (
        <span className="text-sm font-medium flex-shrink-0">{label}</span>
      )}
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className={`${sizeClasses.buttonSize} p-0 flex-shrink-0`}
        onClick={decrement}
        disabled={disabled || currentQty === 0}
      >
        <Minus className={sizeClasses.iconSize} />
      </Button>
      <Input
        type="text"
        value={currentQty > 0 ? currentQty : ''}
        placeholder="0"
        inputMode="numeric"
        pattern="[0-9]*"
        onChange={(e) => onInput(e.target.value)}
        onKeyDown={onInputKeyDown}
        onFocus={onInputFocus}
        disabled={disabled}
        className={`${sizeClasses.inputSize} text-center text-xs sm:text-sm font-medium border-gray-300 focus:border-[#F07712] focus:ring-1 focus:ring-[#F07712] flex-shrink-0`}
      />
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className={`${sizeClasses.buttonSize} p-0 flex-shrink-0`}
        onClick={increment}
        disabled={disabled}
      >
        <Plus className={sizeClasses.iconSize} />
      </Button>
    </div>
  );
};

export default CompactQuantityControls;