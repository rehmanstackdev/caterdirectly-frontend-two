import { createContext, useContext, useState, ReactNode } from 'react';

interface LaunchDatesContextType {
  softLaunchDate: Date | null;
  fullLaunchDate: Date | null;
  updateLaunchDates: (soft: Date | null, full: Date | null) => void;
}

const LaunchDatesContext = createContext<LaunchDatesContextType | undefined>(undefined);

export function LaunchDatesProvider({ children }: { children: ReactNode }) {
  const [softLaunchDate, setSoftLaunchDate] = useState<Date | null>(null);
  const [fullLaunchDate, setFullLaunchDate] = useState<Date | null>(null);

  const updateLaunchDates = (soft: Date | null, full: Date | null) => {
    setSoftLaunchDate(soft);
    setFullLaunchDate(full);
  };

  return (
    <LaunchDatesContext.Provider value={{ softLaunchDate, fullLaunchDate, updateLaunchDates }}>
      {children}
    </LaunchDatesContext.Provider>
  );
}

export function useLaunchDatesContext() {
  const context = useContext(LaunchDatesContext);
  if (!context) {
    throw new Error('useLaunchDatesContext must be used within LaunchDatesProvider');
  }
  return context;
}
