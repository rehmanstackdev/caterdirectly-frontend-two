
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import VendorCertifications from './VendorCertifications';
import GoogleMapsAutocomplete from '@/components/shared/GoogleMapsAutocomplete';
import { LocationData } from '@/components/shared/address/types';

interface VendorApplicationStep2Props {
  form: UseFormReturn<any>;
  populateDemoData?: () => void;
}

const VendorApplicationStep2: React.FC<VendorApplicationStep2Props> = ({ 
  form,
  populateDemoData 
}) => {
  // Ensure certifications field is initialized
  React.useEffect(() => {
    const currentCerts = form.getValues('certifications');
    if (!currentCerts) {
      form.setValue('certifications', {
        insurance_policies: [],
        licenses: [],
        service_area_certifications: []
      });
    }
  }, [form]);

  // Handle address selection from free API
  const handleAddressSelected = (address: string, locationData?: LocationData) => {
    if (locationData) {
      form.setValue('fullAddress', address, { shouldValidate: true });
      form.setValue('address', locationData.street || '', { shouldValidate: true });
      form.setValue('city', locationData.city, { shouldValidate: true });
      form.setValue('state', locationData.state, { shouldValidate: true });
      form.setValue('zipCode', locationData.zipCode || '', { shouldValidate: true });
      form.setValue('coordinatesLat', locationData.lat || 0);
      form.setValue('coordinatesLng', locationData.lng || 0);
    }
  };
  
  // Debug function to check form state
  const debugFormState = () => {
    const fields = ['einTin', 'fullAddress', 'address', 'city', 'state', 'zipCode', 'certifications'];
    console.log('=== Form Debug Info ===');
    fields.forEach(field => {
      const value = form.getValues(field as any);
      const error = form.formState.errors[field];
      console.log(`${field}:`, value, error ? `ERROR: ${error.message}` : '✓');
    });
    console.log('All errors:', form.formState.errors);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Business Details</h2>
      <p className="text-gray-500">Tell us more about your business operations</p>
      
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="einTin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>EIN/TIN</FormLabel>
              <FormControl>
                <Input placeholder="XX-XXXXXXX" {...field} />
              </FormControl>
              <FormDescription>
                Your business tax identification number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="fullAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Address</FormLabel>
            <FormControl>
              <div>
                <GoogleMapsAutocomplete
                  placeholder="Start typing your address..."
                  onAddressSelected={(address, locationData) => {
                    field.onChange(address);
                    handleAddressSelected(address, locationData);
                  }}
                  required
                  value={field.value}
                />
              </div>
            </FormControl>
            <FormDescription>
              Start typing to search for your business address
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch('fullAddress') && (
        <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded space-y-1">
          <p className="font-medium text-green-700 dark:text-green-300">✓ Validated address:</p>
          <p className="text-green-600 dark:text-green-400">{form.watch('address')}</p>
          <p className="text-green-600 dark:text-green-400">{form.watch('city')}, {form.watch('state')} {form.watch('zipCode')}</p>
        </div>
      )}
      <VendorCertifications form={form} />
    </div>
  );
};

export default VendorApplicationStep2;
