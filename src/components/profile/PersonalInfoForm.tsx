
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'sonner';
import { PersonalInfo } from "@/types/profile";
import { useProfile } from "@/hooks/use-profile";
import GoogleMapsAutocomplete from "@/components/shared/GoogleMapsAutocomplete";
import { LocationData } from "@/components/shared/address/types";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  profileImage: z.string().optional(),
  location: z.string().optional(),
  locationData: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    street: z.string().optional(),
    zipCode: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
});

interface PersonalInfoFormProps {
  initialData?: PersonalInfo;
}

const PersonalInfoForm = ({ initialData }: PersonalInfoFormProps) => {
    const { updateProfile } = useProfile();
  const [locationValue, setLocationValue] = useState('');

  // Get initials from first name and last name
  const getInitials = () => {
    const firstName = form.watch('firstName') || initialData?.firstName || '';
    const lastName = form.watch('lastName') || initialData?.lastName || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profileImage: "",
      location: "",
      locationData: undefined,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      // Display only city and state
      if (initialData.locationData?.city && initialData.locationData?.state) {
        setLocationValue(`${initialData.locationData.city}, ${initialData.locationData.state}`);
      } else {
        setLocationValue(initialData.location || '');
      }
    }
  }, [initialData, form]);

  const handleLocationSelected = (address: string, locationData?: LocationData) => {
    // Display only city and state
    if (locationData?.city && locationData?.state) {
      setLocationValue(`${locationData.city}, ${locationData.state}`);
    } else {
      setLocationValue(address);
    }
    form.setValue('location', address);
    if (locationData) {
      form.setValue('locationData', {
        city: locationData.city,
        state: locationData.state,
        street: locationData.street,
        zipCode: locationData.zipCode,
        lat: locationData.lat,
        lng: locationData.lng,
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateProfile('personal', values);
      toast.success('Profile updated', { description: 'Your personal information has been updated successfully.' });
    } catch (e) {
      // toast handled in hook
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and preferences
            </CardDescription>
          </div>
        
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.doe@example.com" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <GoogleMapsAutocomplete
                      placeholder="Enter your address"
                      value={locationValue}
                      onAddressSelected={handleLocationSelected}
                    />
                  </FormControl>
                  <FormDescription>
                    Your location helps us find services near you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;



