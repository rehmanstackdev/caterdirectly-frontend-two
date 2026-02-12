import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface GlassSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300 appearance-none',
            'bg-glass-white backdrop-blur-glass border border-white/50',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50',
            'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            'pr-10',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
