
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RsvpFormValues } from './RsvpFormSchema';

interface DietaryRestrictionsProps {
  form: UseFormReturn<RsvpFormValues>;
}

const DietaryRestrictions = ({ form }: DietaryRestrictionsProps) => {
  return (
    <FormField
      control={form.control}
      name="dietaryRestrictions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dietary Restrictions (optional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Please list any food allergies or dietary restrictions"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DietaryRestrictions;
