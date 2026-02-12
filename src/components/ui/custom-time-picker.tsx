import { useState, useEffect, useRef } from 'react';
import { Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  id?: string;
}

export function CustomTimePicker({ value, onChange, required, className, id }: CustomTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, setHour] = useState('07');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the value (HH:mm format) into hour, minute, period
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hourNum = parseInt(h);
      const isPM = hourNum >= 12;
      const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;

      setHour(hour12.toString().padStart(2, '0'));
      setMinute(m);
      setPeriod(isPM ? 'PM' : 'AM');
    }
  }, [value]);

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

  const handleTimeChange = (newHour: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    const hourNum = parseInt(newHour);
    const hour24 = newPeriod === 'PM'
      ? (hourNum === 12 ? 12 : hourNum + 12)
      : (hourNum === 12 ? 0 : hourNum);

    const timeString = `${hour24.toString().padStart(2, '0')}:${newMinute}`;
    onChange(timeString);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const displayTime = value
    ? `${hour}:${minute} ${period}`
    : 'Select time';

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
        <span className={cn(!value && "text-muted-foreground")}>{displayTime}</span>
        <Clock className="w-4 h-4 text-brand" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="grid grid-cols-3 gap-2 p-4">
            {/* Hours */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 block text-center">Hour</label>
              <div className="h-48 overflow-y-auto custom-scrollbar">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => {
                      setHour(h);
                      handleTimeChange(h, minute, period);
                    }}
                    className={cn(
                      "w-full py-2 px-3 text-sm rounded transition-all",
                      h === hour
                        ? "bg-gradient-to-br from-[#F07712] to-[#FF9142] text-white font-semibold shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 block text-center">Min</label>
              <div className="h-48 overflow-y-auto custom-scrollbar">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMinute(m);
                      handleTimeChange(hour, m, period);
                    }}
                    className={cn(
                      "w-full py-2 px-3 text-sm rounded transition-all",
                      m === minute
                        ? "bg-gradient-to-br from-[#F07712] to-[#FF9142] text-white font-semibold shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 block text-center">Period</label>
              <div className="space-y-2 pt-20">
                {['AM', 'PM'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const newPeriod = p as 'AM' | 'PM';
                      setPeriod(newPeriod);
                      handleTimeChange(hour, minute, newPeriod);
                    }}
                    className={cn(
                      "w-full py-2 px-3 text-sm rounded transition-all",
                      p === period
                        ? "bg-gradient-to-br from-[#F07712] to-[#FF9142] text-white font-semibold shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2 px-4 bg-gradient-to-br from-[#F07712] to-[#FF9142] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
