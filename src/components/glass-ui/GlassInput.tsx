import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-300',
            'bg-glass-white backdrop-blur-glass border border-white/50',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-finance-expense/50 focus:ring-finance-expense/30',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-finance-expense">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
