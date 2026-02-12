
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useGuests } from '@/hooks/use-guests';
import { toast } from 'sonner';

const guestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  tags: z.string().optional()
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingGuest?: any; // Add proper type if editing
}

const GuestEntryDialog = ({ 
  open, 
  onOpenChange,
  existingGuest 
}: GuestEntryDialogProps) => {
  const { addGuest, updateGuest, loading } = useGuests();
  const isEditing = !!existingGuest;
  
  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: existingGuest || {
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      tags: ''
    }
  });

  // Reset form when switching between add/edit and when dialog opens with a guest
  useEffect(() => {
    if (open) {
      form.reset(
        existingGuest
          ? {
              name: existingGuest.name || '',
              email: existingGuest.email || '',
              phone: existingGuest.phone || '',
              company: existingGuest.company || '',
              jobTitle: existingGuest.jobTitle || '',
              tags: existingGuest.tags?.join(', ') || '',
            }
          : {
              name: '',
              email: '',
              phone: '',
              company: '',
              jobTitle: '',
              tags: '',
            }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, existingGuest?.id]);

  const onSubmit = async (data: GuestFormData) => {
    try {
      const processedData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        jobTitle: data.jobTitle,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };
      
      if (isEditing) {
        await updateGuest(existingGuest.id, processedData);
        toast.success("Contact updated successfully");
      } else {
        await addGuest(processedData);
        toast.success("New contact added successfully");
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error("Error saving guest:", error);
      toast.error(error?.message || (isEditing ? "Failed to update contact" : "Failed to add contact"));
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the contact information below" 
              : "Fill in the details to add a new contact to your database"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="jane@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company"
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
              
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input placeholder="VIP, Friend, Client (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {isEditing ? 'Update' : 'Add'} Contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestEntryDialog;
