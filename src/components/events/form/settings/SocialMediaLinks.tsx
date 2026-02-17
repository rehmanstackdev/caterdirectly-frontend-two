
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface SocialMediaLinksProps {
  form: UseFormReturn<any>;
}

const SocialMediaLinks = ({ form }: SocialMediaLinksProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Social Media Links</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="socialMedia.facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Facebook className="h-4 w-4 text-blue-600" /> Facebook URL
              </FormLabel>
              <FormControl>
                <Input placeholder="https://facebook.com/yourpage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialMedia.twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Twitter className="h-4 w-4 text-blue-400" /> Twitter URL
              </FormLabel>
              <FormControl>
                <Input placeholder="https://twitter.com/yourhandle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialMedia.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Instagram className="h-4 w-4 text-pink-600" /> Instagram URL
              </FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/yourprofile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="socialMedia.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn URL
              </FormLabel>
              <FormControl>
                <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SocialMediaLinks;
