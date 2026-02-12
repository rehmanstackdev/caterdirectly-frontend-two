
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllServiceCategories } from './vendorTypeConfig';

interface VendorApplicationStep1Props {
  form: UseFormReturn<any>;
  populateDemoData?: () => void;
}

const VendorApplicationStep1: React.FC<VendorApplicationStep1Props> = ({ 
  form, 
  populateDemoData 
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Business Information</h2>
      <p className="text-gray-500">Tell us about your business</p>
      
      
      <div className="grid grid-cols-1 gap-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Business Name" {...field} />
              </FormControl>
              <FormDescription>
                Enter your registered business name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactFirstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person - First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormDescription>
                First name of the primary contact person for this account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactLastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Person - Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Smith" {...field} />
              </FormControl>
              <FormDescription>
                Last name of the primary contact person for this account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serviceTypes"
          render={() => (
            <FormItem>
              <FormLabel>Marketplace Services</FormLabel>
              <FormDescription>
                Select all marketplace categories you want to provide services for
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {getAllServiceCategories().map((category) => (
                  <FormField
                    key={category.id}
                    control={form.control}
                    name="serviceTypes"
                    render={({ field }) => (
                      <FormItem
                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 hover:bg-accent/5 transition-colors"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(category.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), category.id])
                                : field.onChange(
                                    field.value?.filter((value: string) => value !== category.id)
                                  )
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium cursor-pointer">
                            {category.name}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {category.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" type="email" {...field} />
              </FormControl>
              <FormDescription>
                This will be used for account login and communications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Phone</FormLabel>
              <FormControl>
                <Input placeholder="(123) 456-7890" type="tel" {...field} />
              </FormControl>
              <FormDescription>
                A phone number where customers can reach you
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://yourbusiness.com or www.yourbusiness.com" 
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your business website (e.g., https://yourbusiness.com or www.yourbusiness.com)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default VendorApplicationStep1;
