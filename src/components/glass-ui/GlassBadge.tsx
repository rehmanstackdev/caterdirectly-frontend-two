import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassBadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

export function GlassBadge({ 
  children, 
  variant = 'default', 
  size = 'md', 
  icon,
  className 
}: GlassBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full backdrop-blur-glass border font-medium transition-all',
        {
          'bg-finance-revenue/20 text-finance-revenue border-finance-revenue/30': variant === 'success',
          'bg-finance-pipeline/20 text-finance-pipeline border-finance-pipeline/30': variant === 'warning',
          'bg-finance-expense/20 text-finance-expense border-finance-expense/30': variant === 'danger',
          'bg-brand/20 text-brand border-brand/30': variant === 'info',
          'bg-glass-white text-foreground border-white/50': variant === 'default',
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-1.5 text-base': size === 'lg',
        },
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
