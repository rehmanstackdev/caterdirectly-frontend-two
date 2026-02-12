
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const proposalFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().optional(),
  clientCompany: z.string().optional(),
  message: z.string().optional(),
  expiryDays: z.number().min(1).max(30).default(7),
});

type ProposalFormData = z.infer<typeof proposalFormSchema>;

interface ProposalFormProps {
  onSubmit: (data: ProposalFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  initialValues?: Partial<ProposalFormData>;
}

const ProposalForm = ({ onSubmit, onCancel, isLoading = false, initialValues }: ProposalFormProps) => {
  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      clientName: initialValues?.clientName || '',
      clientEmail: initialValues?.clientEmail || '',
      clientPhone: initialValues?.clientPhone || '',
      clientCompany: initialValues?.clientCompany || '',
      message: initialValues?.message || '',
      expiryDays: initialValues?.expiryDays || 7,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Email *</FormLabel>
                    <FormControl>
                      <Input placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message for the client..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires in (days)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="30" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Proposal...' : 'Send Proposal'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProposalForm;
