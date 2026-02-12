
import { Event } from '@/types/order';

export const isUpcomingEvent = (event: Event): boolean => {
  return new Date(getEventStartDate(event)) >= new Date();
};

export const isPastEvent = (event: Event): boolean => {
  return new Date(getEventEndDate(event)) < new Date();
};

export const formatEventDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatEventTime = (date: Date | string): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getEventStartDate = (event: Event): Date => {
  if (event.startDate instanceof Date) {
    return event.startDate;
  }
  return new Date(event.startDate);
};

export const getEventEndDate = (event: Event): Date => {
  if (event.endDate instanceof Date) {
    return event.endDate;
  }
  return new Date(event.endDate);
};
