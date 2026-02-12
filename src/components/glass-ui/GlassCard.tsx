import { cn } from '@/lib/utils';
import { ReactNode, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive';
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'default', 
  hover = false,
  gradient = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-glass transition-all duration-300',
        {
          'bg-glass-white border-white/50 shadow-glass': variant === 'default',
          'bg-glass-elevated border-white/60 shadow-glass-lg': variant === 'elevated',
          'bg-glass-card border-white/40 shadow-glass': variant === 'interactive',
          'hover:shadow-glass-xl hover:border-white/70 hover:-translate-y-1': hover,
          'bg-gradient-to-br from-white/40 to-white/20': gradient,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
