
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TicketType } from '@/types/order';

interface EventRsvpFormProps {
  eventId: string;
  isTicketed: boolean;
  ticketTypes?: TicketType[];
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  socialMediaLinkedin: z.string().optional(),
  socialMediaTwitter: z.string().optional(),
  socialMediaWebsite: z.string().optional(),
  response: z.enum(["attending", "not_attending"]),
  ticketTypeId: z.string().optional(),
});

const EventRsvpForm = ({
  eventId,
  isTicketed,
  ticketTypes = [],
}: EventRsvpFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      jobTitle: "",
      dietaryRestrictions: "",
      socialMediaLinkedin: "",
      socialMediaTwitter: "",
      socialMediaWebsite: "",
      response: "attending",
      ticketTypeId: isTicketed && ticketTypes.length > 0 ? ticketTypes[0].id : undefined,
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // This would be an API call in a real application
      console.log("Submitting RSVP:", { eventId, ...values });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      toast({
        title: "RSVP Submitted",
        description: values.response === "attending" 
          ? "Thank you for confirming your attendance!"
          : "Thank you for your response. We're sorry you can't make it.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Failed to submit your RSVP. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (submitted) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-center">Thank You!</CardTitle>
          <CardDescription className="text-center">
            Your response has been recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            {form.getValues("response") === "attending"
              ? "We look forward to seeing you at the event."
              : "We're sorry you can't make it, but thank you for letting us know."}
          </p>
          
          {form.getValues("response") === "attending" && isTicketed && (
            <p className="text-sm text-gray-500">
              Please check your email for ticket information and payment instructions.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100); // Convert cents to dollars for display
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-bold">RSVP</h2>
        
        <FormField
          control={form.control}
          name="response"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Will you be attending?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="attending" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Yes, I'll be there
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="not_attending" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      No, I can't make it
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
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
                  <Input placeholder="Your email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} />
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
                <FormLabel>Company (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your job title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isTicketed && form.watch('response') === 'attending' && (
          <FormField
            control={form.control}
            name="ticketTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Ticket Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-3"
                  >
                    {ticketTypes.map((ticket) => (
                      <FormItem 
                        key={ticket.id} 
                        className="flex items-start space-x-3 space-y-0 rounded-md border p-4"
                      >
                        <FormControl>
                          <RadioGroupItem value={ticket.id} />
                        </FormControl>
                        <div className="flex-1">
                          <FormLabel className="text-base font-semibold">
                            {ticket.name} - {formatPrice(ticket.price)}
                          </FormLabel>
                          {ticket.description && (
                            <FormDescription>
                              {ticket.description}
                            </FormDescription>
                          )}
                        </div>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
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
        
        <Button type="submit" className="w-full">
          Submit RSVP
        </Button>
      </form>
    </Form>
  );
};

export default EventRsvpForm;
