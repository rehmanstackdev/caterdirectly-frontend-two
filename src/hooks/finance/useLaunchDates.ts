import { useState } from 'react';

export interface LaunchDates {
  softLaunchDate: Date | null;
  fullLaunchDate: Date | null;
}

export function useLaunchDates() {
  const [dates, setDates] = useState<LaunchDates>({
    softLaunchDate: null,
    fullLaunchDate: null,
  });
  const [loading] = useState(false);

  const updateLaunchDates = (softLaunchDate: Date | null, fullLaunchDate: Date | null) => {
    setDates({ softLaunchDate, fullLaunchDate });
  };

  return { ...dates, loading, updateLaunchDates };
}
