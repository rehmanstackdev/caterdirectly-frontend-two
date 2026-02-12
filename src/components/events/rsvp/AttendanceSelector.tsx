
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { RsvpFormValues } from './RsvpFormSchema';

interface AttendanceSelectorProps {
  form: UseFormReturn<RsvpFormValues>;
}

const AttendanceSelector = ({ form }: AttendanceSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="response"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Will you be attending?</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="attending" />
                </FormControl>
                <FormLabel className="font-normal">
                  Yes, I'll be there
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="not_attending" />
                </FormControl>
                <FormLabel className="font-normal">
                  No, I can't make it
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AttendanceSelector;
