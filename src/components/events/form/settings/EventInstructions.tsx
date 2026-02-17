
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface EventInstructionsProps {
  form: UseFormReturn<any>;
}

const EventInstructions = ({ form }: EventInstructionsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="parking"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parking Information <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Details about parking availability, cost, etc." 
                className="min-h-[80px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="specialInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Special Instructions <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Any additional details or instructions for attendees" 
                className="min-h-[80px]" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default EventInstructions;
