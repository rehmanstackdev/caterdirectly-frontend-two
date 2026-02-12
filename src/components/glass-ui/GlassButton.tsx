import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300',
          'backdrop-blur-glass border disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-brand text-white border-brand/50 shadow-glass hover:shadow-glass-lg hover:bg-brand/90':
              variant === 'primary',
            'bg-glass-white text-foreground border-white/50 shadow-glass hover:shadow-glass-lg hover:bg-white/60':
              variant === 'secondary',
            'bg-transparent text-foreground border-transparent hover:bg-white/20': variant === 'ghost',
            'bg-finance-expense/20 text-finance-expense border-finance-expense/30 hover:bg-finance-expense/30':
              variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';
