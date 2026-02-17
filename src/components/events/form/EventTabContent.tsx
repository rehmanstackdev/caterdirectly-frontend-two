
import { UseFormReturn } from 'react-hook-form';
import { TabsContent } from '@/components/ui/tabs';
import BasicInfoTab from './BasicInfoTab';
import EventSettingsTab from './EventSettingsTab';
import EventTicketsSection from '../EventTicketsSection';
import { EventFormValues } from './EventFormSchema';
import { TicketType } from '@/types/order';

interface EventTabContentProps {
  form: UseFormReturn<EventFormValues>;
  isTicketed: boolean;
  ticketTypes: TicketType[];
  onAddTicket: (ticket: Omit<TicketType, 'id' | 'sold'>) => void;
  onEditTicket: (index: number, ticket: Partial<TicketType>) => void;
  onRemoveTicket: (index: number) => void;
  showTicketError?: boolean;
}

const EventTabContent = ({
  form,
  isTicketed,
  ticketTypes,
  onAddTicket,
  onEditTicket,
  onRemoveTicket,
  showTicketError = false,
}: EventTabContentProps) => {
  return (
    <>
      <TabsContent value="basic">
        <BasicInfoTab form={form} />
      </TabsContent>
      
      <TabsContent value="settings">
        <EventSettingsTab form={form} />
      </TabsContent>
      
      {isTicketed && (
        <TabsContent value="tickets">
          <EventTicketsSection
            ticketTypes={ticketTypes}
            onAddTicket={onAddTicket}
            onEditTicket={onEditTicket}
            onRemoveTicket={onRemoveTicket}
            showRequiredError={showTicketError}
          />
        </TabsContent>
      )}
    </>
  );
};

export default EventTabContent;
