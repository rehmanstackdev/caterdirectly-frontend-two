
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RsvpFormValues } from './RsvpFormSchema';

interface SocialMediaFieldsProps {
  form: UseFormReturn<RsvpFormValues>;
}

const SocialMediaFields = ({ form }: SocialMediaFieldsProps) => {
  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold mb-4">Social Media & Networking (optional)</h3>
      <p className="text-sm text-gray-500 mb-4">
        Share your profiles to connect with other attendees
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="socialMediaLinkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn</FormLabel>
              <FormControl>
                <Input placeholder="Your LinkedIn username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="socialMediaTwitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter</FormLabel>
              <FormControl>
                <Input placeholder="Your Twitter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="socialMediaWebsite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="Your personal or company website" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SocialMediaFields;
