
import { useState, useEffect } from 'react';
import { ServiceItem } from '@/types/service-types';

interface UseServicePaginationProps {
  services: ServiceItem[];
  itemsPerPage?: number;
}

export const useServicePagination = ({ 
  services, 
  itemsPerPage = 9 
}: UseServicePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedServices, setPaginatedServices] = useState<ServiceItem[]>([]);
  
  const totalPages = Math.ceil(services.length / itemsPerPage);
  
  // Reset to page 1 when services list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [services.length]);
  
  // Update paginated services when page or services change
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedServices(services.slice(startIndex, endIndex));
  }, [services, currentPage, itemsPerPage]);
  
  return {
    currentPage,
    totalPages,
    paginatedServices,
    setCurrentPage,
    noServicesAvailable: services.length === 0
  };
};
