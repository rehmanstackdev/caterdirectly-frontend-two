

import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { TicketType } from '@/types/order';
import { RsvpFormValues } from './RsvpFormSchema';

interface TicketSelectorProps {
  form: UseFormReturn<RsvpFormValues>;
  ticketTypes: TicketType[];
}

const TicketSelector = ({ form, ticketTypes }: TicketSelectorProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100); // Convert cents to dollars for display
  };

  // Only show if user is attending and there are ticket types
  if (form.watch('response') !== 'attending' || ticketTypes.length === 0) {
    return null;
  }

  return (
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
  );
};

export default TicketSelector;
