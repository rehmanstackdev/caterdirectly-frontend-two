import { useEffect, useState } from "react";

export function useResponsiveKanban() {
  const [columnWidth, setColumnWidth] = useState(320);
  const [columnsPerView, setColumnsPerView] = useState(4);

  useEffect(() => {
    const updateKanbanLayout = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        // Mobile: Single column, full width
        setColumnWidth(width - 32); // Account for padding
        setColumnsPerView(1);
      } else if (width < 1024) {
        // Tablet: 2 columns
        setColumnWidth(Math.min(300, (width - 48) / 2)); // Account for gaps
        setColumnsPerView(2);
      } else if (width < 1440) {
        // Desktop: 3-4 columns
        setColumnWidth(280);
        setColumnsPerView(3);
      } else {
        // Large Desktop: 4+ columns
        setColumnWidth(320);
        setColumnsPerView(4);
      }
    };

    updateKanbanLayout();
    window.addEventListener('resize', updateKanbanLayout);
    
    return () => window.removeEventListener('resize', updateKanbanLayout);
  }, []);

  return { columnWidth, columnsPerView };
}