import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface OrderProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const OrderProgressIndicator = ({
  steps,
  currentStep,
  className
}: OrderProgressIndicatorProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Step indicator */}
              <div className="flex items-center w-full">
                {/* Circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    {
                      "bg-primary border-primary text-primary-foreground": isCompleted,
                      "bg-primary/10 border-primary text-primary animate-pulse": isCurrent,
                      "bg-muted border-muted-foreground/30 text-muted-foreground": isUpcoming
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-colors",
                      {
                        "bg-primary": isCompleted,
                        "bg-primary/30": isCurrent,
                        "bg-muted": isUpcoming
                      }
                    )}
                  />
                )}
              </div>

              {/* Step info */}
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    "text-xs font-medium",
                    {
                      "text-primary": isCompleted || isCurrent,
                      "text-muted-foreground": isUpcoming
                    }
                  )}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current step details */}
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <div className="text-sm font-medium text-foreground">
          Step {currentStep} of {steps.length}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {steps[currentStep - 1]?.description || "Processing your order..."}
        </div>
      </div>
    </div>
  );
};