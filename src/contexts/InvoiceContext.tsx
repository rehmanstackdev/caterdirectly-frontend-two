
import { createContext, useContext, useState, ReactNode, startTransition, useCallback, useMemo } from 'react';
import { logger } from '@/utils/logger';

interface InvoiceContextType {
  isInvoiceMode: boolean;
  setInvoiceMode: (mode: boolean) => void;
  invoiceData: {
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    clientCompany?: string;
    message?: string;
    expiryDate?: Date;
  };
  setInvoiceData: (data: any) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const [isInvoiceMode, setIsInvoiceMode] = useState(false);
  const [invoiceData, setInvoiceData] = useState({});

  // ENTERPRISE FIX: Memoize setInvoiceMode to prevent re-render loops
  // CRITICAL: Empty dependency array to ensure stable function identity
  const setInvoiceMode = useCallback((mode: boolean) => {
    if (import.meta.env.DEV) {
      console.count('[InvoiceContext] setInvoiceMode called');
      console.log('[InvoiceContext] 📝 Setting invoice mode to:', mode);
    }
    
    // Use React 18+ startTransition for non-urgent state updates
    startTransition(() => {
      setIsInvoiceMode(mode);
    });
  }, []); // Empty deps - stable function identity

  // ENTERPRISE FIX: Memoize setInvoiceDataWithLogging to prevent re-render loops
  const setInvoiceDataWithLogging = useCallback((data: any) => {
    if (import.meta.env.DEV) {
      console.count('[InvoiceContext] setInvoiceData called');
      console.log('[InvoiceContext] 📝 Setting invoice data:', data);
    }
    
    // Validate invoice data structure
    if (data && typeof data === 'object') {
      const validKeys = ['clientName', 'clientEmail', 'clientPhone', 'clientCompany', 'message', 'expiryDate'];
      const invalidKeys = Object.keys(data).filter(key => !validKeys.includes(key));
      
      if (invalidKeys.length > 0 && import.meta.env.DEV) {
        console.warn('[InvoiceContext] ⚠️ Invalid keys detected:', invalidKeys);
      }
    }
    
    startTransition(() => {
      setInvoiceData(data);
    });
  }, []);

  if (import.meta.env.DEV) {
    console.count('[InvoiceContext] Provider render');
  }

  // ENTERPRISE FIX: Memoize provider value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isInvoiceMode,
    setInvoiceMode,
    invoiceData,
    setInvoiceData: setInvoiceDataWithLogging
  }), [isInvoiceMode, setInvoiceMode, invoiceData, setInvoiceDataWithLogging]);

  return (
    <InvoiceContext.Provider value={contextValue}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within InvoiceProvider');
  }
  return context;
};
