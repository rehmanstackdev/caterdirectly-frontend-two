import { useState } from 'react';
import { Calendar, Rocket, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLaunchDatesContext } from '@/contexts/LaunchDatesContext';
import { useToast } from '@/hooks/use-toast';

export function LaunchDateSettings() {
  const { softLaunchDate, fullLaunchDate, updateLaunchDates } = useLaunchDatesContext();
  const [softDate, setSoftDate] = useState<string>('');
  const [fullDate, setFullDate] = useState<string>('');
  const { toast } = useToast();

  const handleSave = () => {
    updateLaunchDates(
      softDate ? new Date(softDate) : null,
      fullDate ? new Date(fullDate) : null
    );
    toast({
      title: 'Date Range Applied',
      description: 'Filtering data by selected date range.',
    });
  };

  const isDisabled = !softDate || !fullDate || new Date(softDate) > new Date(fullDate);



  return (
    <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-glass p-6 transition-all duration-300 hover:shadow-glass-lg">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-6 flex-1">
          {/* Start Event Date */}
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Start Event Date
            </label>
            <input
              type="date"
              value={softDate}
              onChange={(e) => setSoftDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* End Event Date */}
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Event Date
            </label>
            <input
              type="date"
              value={fullDate}
              onChange={(e) => setFullDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
        </div>

        {/* Apply Filter Button */}
        <Button
          onClick={handleSave}
          disabled={isDisabled}
          className="bg-brand hover:bg-brand/90 text-white shadow-md hover:shadow-lg transition-all duration-300 px-6 h-11 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          Apply Filter
        </Button>
      </div>
    </div>
  );
}
