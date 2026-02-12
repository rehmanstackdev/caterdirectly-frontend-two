
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
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
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <Input placeholder="Facebook URL" {...field} />
                </div>
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
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <Input placeholder="Twitter URL" {...field} />
                </div>
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
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <Input placeholder="Instagram URL" {...field} />
                </div>
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
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <Input placeholder="LinkedIn URL" {...field} />
                </div>
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
