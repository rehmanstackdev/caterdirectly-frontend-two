import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EventService, EventServiceInsert } from '@/types/event-services';
import { toast } from 'sonner';

export const useEventServices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addServiceToEvent = async (eventServiceData: EventServiceInsert): Promise<EventService | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_services')
        .insert(eventServiceData)
        .select()
        .single();

      if (error) {
        console.error('Error adding service to event:', error);
        toast.error('Failed to add service to event');
        return null;
      }

      toast.success('Service added to event successfully');
      return data;
    } catch (error) {
      console.error('Error adding service to event:', error);
      toast.error('Failed to add service to event');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeServiceFromEvent = async (eventServiceId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('event_services')
        .delete()
        .eq('id', eventServiceId);

      if (error) {
        console.error('Error removing service from event:', error);
        toast.error('Failed to remove service from event');
        return false;
      }

      toast.success('Service removed from event successfully');
      return true;
    } catch (error) {
      console.error('Error removing service from event:', error);
      toast.error('Failed to remove service from event');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getEventServices = async (eventId: string): Promise<EventService[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_services')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching event services:', error);
        toast.error('Failed to fetch event services');
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching event services:', error);
      toast.error('Failed to fetch event services');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addOrderToEvent = async (eventId: string, orderId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // First, update the order to include the event_id
      const { error: orderError } = await supabase
        .from('orders')
        .update({ event_id: eventId })
        .eq('id', orderId);

      if (orderError) {
        console.error('Error updating order with event_id:', orderError);
        toast.error('Failed to associate order with event');
        return false;
      }

      // Then, create an event_services record
      const { error: eventServiceError } = await supabase
        .from('event_services')
        .insert({
          event_id: eventId,
          order_id: orderId
        });

      if (eventServiceError) {
        console.error('Error creating event service record:', eventServiceError);
        toast.error('Failed to add order to event');
        return false;
      }

      toast.success('Order added to event successfully');
      return true;
    } catch (error) {
      console.error('Error adding order to event:', error);
      toast.error('Failed to add order to event');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addServiceToEvent,
    removeServiceFromEvent,
    getEventServices,
    addOrderToEvent,
  };
};