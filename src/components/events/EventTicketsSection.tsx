
import { useState } from 'react';
import { TicketType } from '@/types/order';
import AddTicketDialog from './tickets/AddTicketDialog';
import TicketCard from './tickets/TicketCard';
import EmptyTicketState from './tickets/EmptyTicketState';
import EditTicketDialog from './tickets/EditTicketDialog';

interface EventTicketsSectionProps {
  ticketTypes: TicketType[];
  onAddTicket: (ticket: Omit<TicketType, 'id' | 'sold'>) => void;
  onEditTicket: (index: number, ticket: Partial<TicketType>) => void;
  onRemoveTicket: (index: number) => void;
}

const EventTicketsSection = ({
  ticketTypes,
  onAddTicket,
  onEditTicket,
  onRemoveTicket,
}: EventTicketsSectionProps) => {
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (index: number) => {
    setEditingTicketIndex(index);
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditingTicketIndex(null);
    setIsEditDialogOpen(false);
  };

  const handleEditTicket = (ticketData: Partial<TicketType>) => {
    if (editingTicketIndex !== null) {
      onEditTicket(editingTicketIndex, ticketData);
      handleEditDialogClose();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Ticket Options</h3>
        <AddTicketDialog onAddTicket={onAddTicket} />
      </div>
      
      {!ticketTypes || ticketTypes.length === 0 ? (
        <EmptyTicketState />
      ) : (
        <div className="space-y-4">
          {ticketTypes.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={() => handleEditClick(index)}
              onRemove={() => onRemoveTicket(index)}
            />
          ))}
        </div>
      )}

      {editingTicketIndex !== null && ticketTypes[editingTicketIndex] && (
        <EditTicketDialog 
          ticket={ticketTypes[editingTicketIndex]}
          isOpen={isEditDialogOpen}
          onClose={handleEditDialogClose}
          onSave={handleEditTicket}
        />
      )}
    </div>
  );
};

export default EventTicketsSection;
