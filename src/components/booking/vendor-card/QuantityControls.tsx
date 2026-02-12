
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface QuantityControlsProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  serviceType?: string;
}

const QuantityControls = ({
  quantity,
  onQuantityChange,
  serviceType
}: QuantityControlsProps) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Update input value when quantity prop changes
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleIncrement = () => {
    onQuantityChange(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < 1) {
      // Reset to current quantity if invalid input
      setInputValue(quantity.toString());
    } else {
      // Update quantity if valid
      onQuantityChange(numValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
      e.currentTarget.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when the input is focused
    e.target.select();
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 w-full overflow-x-hidden">
        <label className="text-sm sm:text-base font-medium text-gray-700 flex-shrink-0">
          {serviceType === 'venue' || serviceType === 'venues' ? 'Hours:' : 'Quantity:'}
        </label>
        <div className="flex items-center justify-center xs:justify-end gap-3 overflow-x-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full border-gray-300 hover:bg-gray-50 disabled:opacity-50 flex-shrink-0"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            min="1"
            step="1"
            className="w-16 h-9 sm:h-10 text-center text-base sm:text-lg font-semibold border-gray-300 rounded-md px-2"
            aria-label="Quantity input"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            className="h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-full border-gray-300 hover:bg-gray-50 flex-shrink-0"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuantityControls;
