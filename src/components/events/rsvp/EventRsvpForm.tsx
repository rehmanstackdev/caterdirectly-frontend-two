
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TicketType } from '@/types/order';
import { rsvpFormSchema, RsvpFormValues } from './RsvpFormSchema';
import AttendanceSelector from './AttendanceSelector';
import PersonalInfoFields from './PersonalInfoFields';
import TicketSelector from './TicketSelector';
import DietaryRestrictions from './DietaryRestrictions';
import SocialMediaFields from './SocialMediaFields';
import ThankYouCard from './ThankYouCard';
import { invitationService } from '@/services/invitation-service';
import FoodSelection from './FoodSelection';
import { Loader } from 'lucide-react';

interface EventRsvpFormProps {
  eventId: string;
  isTicketed: boolean;
  ticketTypes?: TicketType[];
  token?: string | null;
  guestInfo?: any;
  hasGroupOrdering?: boolean;
}

const EventRsvpForm = ({
  eventId,
  isTicketed,
  ticketTypes = [],
  token = null,
  guestInfo = null,
  hasGroupOrdering = false
}: EventRsvpFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<any[]>([]);
  
  // Fetch menu items if this event has group ordering
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (hasGroupOrdering) {
        try {
          // In a real implementation, we would fetch menu items from the order
          // For now, we'll just create some mock menu items
          setMenuItems([
            { id: '1', name: 'Chicken Entree', price: 1500, description: 'Grilled chicken with vegetables' },
            { id: '2', name: 'Vegetarian Option', price: 1200, description: 'Roasted vegetables with quinoa' },
            { id: '3', name: 'Beef Option', price: 1800, description: 'Beef tenderloin with potatoes' },
            { id: '4', name: 'Fish Option', price: 1700, description: 'Grilled salmon with rice' },
            { id: '5', name: 'Vegan Plate', price: 1300, description: 'Plant-based protein with vegetables' }
          ]);
        } catch (error) {
          console.error('Error fetching menu items:', error);
          toast({
            title: "Couldn't load menu options",
            description: "There was an error loading the food options",
            variant: "destructive",
          });
        }
      }
    };
    
    fetchMenuItems();
  }, [hasGroupOrdering, toast]);
  
  // Pre-populate form with guest info if available
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      name: guestInfo?.name || "",
      email: guestInfo?.email || "",
      phone: guestInfo?.phone || "",
      company: guestInfo?.company || "",
      jobTitle: guestInfo?.jobTitle || "",
      dietaryRestrictions: guestInfo?.dietaryRestrictions || "",
      socialMediaLinkedin: guestInfo?.socialMediaLinkedin || "",
      socialMediaTwitter: guestInfo?.socialMediaTwitter || "",
      socialMediaWebsite: guestInfo?.socialMediaWebsite || "",
      response: guestInfo?.rsvpStatus === 'confirmed' ? 'attending' : 'not_attending',
      ticketTypeId: isTicketed && ticketTypes.length > 0 ? 
        (guestInfo?.ticketTypeId || ticketTypes[0].id) : undefined,
    },
  });
  
  // When a food item is selected/deselected
  const handleFoodSelection = (item: any, quantity: number) => {
    if (quantity === 0) {
      setSelectedFoodItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      const newItem = { ...item, quantity };
      setSelectedFoodItems(prev => {
        const existingIndex = prev.findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
          const newItems = [...prev];
          newItems[existingIndex] = newItem;
          return newItems;
        } else {
          return [...prev, newItem];
        }
      });
    }
  };
  
  const onSubmit = async (values: RsvpFormValues) => {
    setIsSubmitting(true);
    try {
      // If no token, this would be a public RSVP
      if (!token) {
        // Use events API to add this guest
        console.log("Public RSVP submission:", { eventId, ...values });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitted(true);
        toast({
          title: "RSVP Submitted",
          description: values.response === "attending" 
            ? "Thank you for confirming your attendance!"
            : "Thank you for your response. We're sorry you can't make it.",
        });
        return;
      }
      
      // With token, we use the invitation service
      const rsvpStatus = values.response === 'attending' ? 'confirmed' : 'declined';
      
      // Prepare food selection data if we have any
      const foodSelection = selectedFoodItems.length > 0 ? {
        items: selectedFoodItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      } : undefined;
      
      console.log("Token RSVP submission:", { 
        token, 
        rsvpStatus,
        foodSelection,
        values
      });
      
      const result = await invitationService.updateGuestRsvpWithToken(token, rsvpStatus, foodSelection);
      
      if (result) {
        setSubmitted(true);
        toast({
          title: "RSVP Submitted",
          description: values.response === "attending" 
            ? "Thank you for confirming your attendance!"
            : "Thank you for your response. We're sorry you can't make it.",
        });
      } else {
        throw new Error("Failed to update RSVP status");
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast({
        title: "Something went wrong",
        description: "Failed to submit your RSVP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return <ThankYouCard 
      response={form.getValues("response")} 
      isTicketed={isTicketed} 
      foodSelection={selectedFoodItems.length > 0 ? selectedFoodItems : undefined} 
    />;
  }
  
  // Determine whether to show the email field
  // If we have a token, we pre-fill and disable the email field
  const showEmailField = !token || !guestInfo?.email;
  
  const isAttending = form.watch('response') === 'attending';
  const showFoodSelection = isAttending && hasGroupOrdering && menuItems.length > 0;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-bold">RSVP</h2>
        
        <AttendanceSelector form={form} />
        
        <PersonalInfoFields form={form} disableEmail={!!token && !!guestInfo?.email} />
        
        {isTicketed && isAttending && <TicketSelector form={form} ticketTypes={ticketTypes} />}
        
        {showFoodSelection && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Food Selection</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please select your meal preferences for the event
            </p>
            
            <FoodSelection 
              menuItems={menuItems}
              onFoodSelect={handleFoodSelection}
              selectedItems={selectedFoodItems}
            />
          </div>
        )}
        
        <DietaryRestrictions form={form} />
        
        <SocialMediaFields form={form} />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit RSVP"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EventRsvpForm;
