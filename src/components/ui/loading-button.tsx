import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, disabled, className, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!loading && !disabled) {
        setIsPressed(true);
        // Reset pressed state after animation
        setTimeout(() => setIsPressed(false), 150);
        
        if (props.onClick) {
          props.onClick(e);
        }
      }
    };
    
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'transition-all duration-150 ease-in-out',
          loading && 'animate-pulse',
          isPressed && 'scale-[0.98] brightness-95',
          className
        )}
        {...props}
        onClick={handleClick}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? (loadingText || 'Loading...') : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';