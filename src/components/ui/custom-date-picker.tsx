import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
}

export function CustomDatePicker({ value, onChange, required, className, id }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onChange(format(today, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const displayDate = value
    ? format(new Date(value + 'T00:00:00'), 'MM/dd/yyyy')
    : 'Select date';

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={cn(
          "w-full px-3 py-2 rounded-lg border border-white/50 bg-glass-white backdrop-blur-glass",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/50",
          "cursor-pointer flex items-center justify-between",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn(!value && "text-muted-foreground")}>{displayDate}</span>
        <CalendarIcon className="w-4 h-4 text-brand" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-br from-[#F07712] to-[#FF9142] text-white">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isCurrentDay = isToday(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "w-9 h-9 text-sm rounded-lg transition-all",
                      "flex items-center justify-center",
                      !isCurrentMonth && "text-gray-300",
                      isCurrentMonth && !isSelected && "text-gray-700 hover:bg-orange-50",
                      isCurrentDay && !isSelected && "ring-2 ring-orange-300 font-semibold",
                      isSelected && "bg-gradient-to-br from-[#F07712] to-[#FF9142] text-white font-bold shadow-md scale-105"
                    )}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-600 hover:text-brand transition px-3 py-1 rounded hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-sm text-brand hover:text-[#FF9142] transition font-medium px-3 py-1 rounded hover:bg-orange-50"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
