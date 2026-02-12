import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  time?: string;
  onSelect?: (time: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ time, onSelect, placeholder = "Select time", className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Generate time options (every 15 minutes)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTimeDisplay(timeString);
        options.push({ value: timeString, display: displayTime });
      }
    }
    return options;
  };

  const formatTimeDisplay = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeOptions = generateTimeOptions();

  const handleTimeSelect = (selectedTime: string) => {
    onSelect?.(selectedTime);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? formatTimeDisplay(time) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 max-h-64 overflow-y-auto" align="start">
        <div className="p-2">
          <div className="grid gap-1">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal h-8",
                  time === option.value && "bg-accent text-accent-foreground"
                )}
                onClick={() => handleTimeSelect(option.value)}
              >
                {option.display}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}