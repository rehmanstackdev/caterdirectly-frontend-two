
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface EventCapacityAndUrlProps {
  form: UseFormReturn<any>;
}

const EventCapacityAndUrl = ({ form }: EventCapacityAndUrlProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capacity (optional)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="100" 
                {...field}
                value={field.value || ''}
                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)} 
              />
            </FormControl>
            <FormDescription>
              Maximum number of guests
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="eventUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Website (optional)</FormLabel>
            <FormControl>
              <Input placeholder="https://myevent.com" {...field} />
            </FormControl>
            <FormDescription>
              Link to your event website or registration page
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EventCapacityAndUrl;
