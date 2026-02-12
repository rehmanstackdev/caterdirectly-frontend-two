
import { forwardRef, useState, ComponentPropsWithoutRef, ElementRef } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

interface EnhancedSliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  formatValue?: (value: number) => string;
  showTooltip?: boolean;
  unit?: string;
  step?: number;
}

const EnhancedSlider = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  EnhancedSliderProps
>(({ className, formatValue, showTooltip = true, unit = "", ...props }, ref) => {
  const [isDragging, setIsDragging] = useState(false);
  const value = props.value || props.defaultValue || [0];

  const defaultFormatValue = (val: number) => `${val}${unit}`;
  const formatter = formatValue || defaultFormatValue;

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center group",
          className
        )}
        onValueChange={props.onValueChange}
        onValueCommit={props.onValueCommit}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-muted via-muted/80 to-muted border border-border/20">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-200" />
        </SliderPrimitive.Track>
        
        {value.map((val, index) => (
          <SliderPrimitive.Thumb 
            key={index}
            className="block h-6 w-6 rounded-full border-2 border-primary bg-background shadow-lg ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-xl group-hover:border-primary/80 relative"
          >
            {showTooltip && (isDragging || false) && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1.5 rounded-md shadow-lg border text-sm font-medium whitespace-nowrap z-50 animate-in fade-in-0 zoom-in-95">
                {formatter(val)}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-popover"></div>
              </div>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    </div>
  )
})
EnhancedSlider.displayName = SliderPrimitive.Root.displayName

export { EnhancedSlider }
