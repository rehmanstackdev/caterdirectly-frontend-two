
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TicketType } from '@/types/order';
import { EventFormValues } from './EventFormSchema';

export const useTicketTypeHandler = (form: UseFormReturn<EventFormValues>) => {
  const [editingTicketIndex, setEditingTicketIndex] = useState<number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const ticketTypes = form.watch('ticketTypes') as TicketType[];
  
  const handleAddTicketType = (ticketType: Omit<TicketType, 'id' | 'sold'>) => {
    const currentTickets = form.getValues('ticketTypes') || [];
    
    // Create a complete TicketType object with all required fields explicitly typed
    const newTicket: TicketType = {
      id: `ticket-${Date.now()}`, // Generate a unique ID
      name: ticketType.name,
      price: ticketType.price,
      sold: 0, // Default value for new tickets
      ...(ticketType.description ? { description: ticketType.description } : {}),
      ...(ticketType.quantity !== undefined ? { quantity: ticketType.quantity } : {})
    };
    
    // Set the value with explicit typing
    form.setValue('ticketTypes', [...currentTickets, newTicket]);
  };
  
  const handleEditTicketType = (index: number, updatedTicket: Partial<TicketType>) => {
    const currentTickets = form.getValues('ticketTypes') as TicketType[];
    const newTickets = [...currentTickets];
    
    // Preserve the id and sold values while updating other fields
    newTickets[index] = {
      ...newTickets[index],
      ...updatedTicket,
      id: currentTickets[index].id,
      sold: currentTickets[index].sold || 0
    };
    
    form.setValue('ticketTypes', newTickets);
  };
  
  const handleRemoveTicketType = (index: number) => {
    const currentTickets = form.getValues('ticketTypes') as TicketType[];
    form.setValue(
      'ticketTypes',
      currentTickets.filter((_, i) => i !== index)
    );
  };
  
  return {
    ticketTypes,
    editingTicketIndex,
    isEditDialogOpen,
    setEditingTicketIndex,
    setIsEditDialogOpen,
    handleAddTicketType,
    handleEditTicketType,
    handleRemoveTicketType
  };
};
