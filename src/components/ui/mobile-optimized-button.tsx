import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileOptimizedButtonProps extends ButtonProps {
  touchOptimized?: boolean;
}

export const MobileOptimizedButton = React.forwardRef<HTMLButtonElement, MobileOptimizedButtonProps>(
  ({ touchOptimized = true, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          touchOptimized && [
            "min-h-[44px]", // Apple's recommended minimum touch target
            "min-w-[44px]",
            "px-4 py-3", // Increased padding for better touch areas
            "text-base sm:text-sm", // Larger text on mobile
            "active:scale-95", // Touch feedback
            "transition-transform duration-100" // Smooth touch animation
          ],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

MobileOptimizedButton.displayName = 'MobileOptimizedButton';