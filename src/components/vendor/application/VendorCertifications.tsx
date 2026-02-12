import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Award, FileText } from 'lucide-react';

interface VendorCertificationsProps {
  form: UseFormReturn<any>;
}

const INSURANCE_OPTIONS = [
  { value: 'general_liability', label: 'General Liability Insurance' },
  { value: 'product_liability', label: 'Product Liability Insurance' },
  { value: 'professional_liability', label: 'Professional Liability Insurance' },
  { value: 'property_insurance', label: 'Property Insurance' },
  { value: 'workers_compensation', label: 'Workers Compensation' }
];

const LICENSE_OPTIONS = [
  { value: 'liquor_license', label: 'Liquor License' },
  { value: 'catering_permit', label: 'Catering Permit' },
  { value: 'food_handler_permit', label: 'Food Handler Permit' },
  { value: 'business_license', label: 'Business License' },
  { value: 'health_department_permit', label: 'Health Department Permit' }
];

const VendorCertifications: React.FC<VendorCertificationsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Certifications & Licenses</h3>
        <p className="text-muted-foreground">
          Select all insurance policies and licenses your business currently holds. 
          This helps venues understand your capabilities and requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-blue-600" />
              Insurance Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="certifications.insurance_policies"
              render={() => (
                <FormItem>
                  <div className="space-y-3">
                    {INSURANCE_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="certifications.insurance_policies"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, option.value])
                                      : field.onChange(
                                          currentValue.filter(
                                            (value: string) => value !== option.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4 text-green-600" />
              Licenses & Permits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="certifications.licenses"
              render={() => (
                <FormItem>
                  <div className="space-y-3">
                    {LICENSE_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="certifications.licenses"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    const currentValue = field.value || [];
                                    return checked
                                      ? field.onChange([...currentValue, option.value])
                                      : field.onChange(
                                          currentValue.filter(
                                            (value: string) => value !== option.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Documentation Requirements
              </p>
              <p className="text-sm text-blue-700">
                You may be required to provide proof of insurance and licenses during 
                the verification process. Having these certifications increases your 
                eligibility for more venue partnerships.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCertifications;