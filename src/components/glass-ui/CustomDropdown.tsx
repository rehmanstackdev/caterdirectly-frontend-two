import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: DropdownOption[];
  className?: string;
  id?: string;
}

export function CustomDropdown({ value, onChange, options, className, id }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (optionValue: string) => {
    // Create a synthetic event to maintain compatibility with existing onChange handlers
    const syntheticEvent = {
      target: { value: optionValue },
      currentTarget: { value: optionValue },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption?.label || 'Select an option';

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={cn(
          'w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 cursor-pointer',
          'bg-glass-white backdrop-blur-glass',
          'focus:outline-none flex items-center justify-between',
          isOpen
            ? 'border-2 border-brand shadow-[0_0_0_3px_rgba(240,119,18,0.1)]'
            : 'border border-white/50 hover:border-brand/30',
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-foreground font-medium">{displayValue}</span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen ? "rotate-180 text-brand" : "text-muted-foreground"
        )} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionClick(option.value)}
                className={cn(
                  "w-full px-4 py-2.5 text-sm text-left transition-all flex items-center justify-between",
                  isSelected
                    ? "bg-gradient-to-r from-[#F07712] to-[#FF9142] text-white font-medium"
                    : "hover:bg-orange-50 text-gray-700"
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
