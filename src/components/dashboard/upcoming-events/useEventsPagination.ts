
import { useState, useMemo } from "react";
import { parseISO, startOfDay, compareAsc } from "date-fns";
import { Event } from "@/types/order";

export const EVENTS_PER_PAGE = 3;

export const useEventsPagination = (events: Event[]) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter for upcoming events only
  const upcomingEvents = useMemo(() => {
    const toDate = (d: string | Date) => (typeof d === 'string' ? parseISO(d) : d);
    const today = startOfDay(new Date());
    const filtered = events.filter(e => {
      const sd = toDate(e.startDate);
      return startOfDay(sd) >= today;
    });
    return filtered.sort((a, b) => compareAsc(toDate(a.startDate), toDate(b.startDate)));
  }, [events]);
  
  const totalPages = Math.ceil(upcomingEvents.length / EVENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const endIndex = Math.min(startIndex + EVENTS_PER_PAGE, upcomingEvents.length);
  const currentEvents = upcomingEvents.slice(startIndex, endIndex);
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    upcomingEvents,
    currentEvents,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,
    handlePageChange,
  };
};
