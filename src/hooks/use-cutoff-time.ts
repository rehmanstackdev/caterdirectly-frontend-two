
import { useState, useEffect } from 'react';

export const useCutoffTime = (cutoffTime: Date | undefined) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  useEffect(() => {
    if (!cutoffTime) return;
    
    const calculateTimeRemaining = () => {
      const now = new Date();
      const diff = cutoffTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Cutoff time passed");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    };
    
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 60000);
    
    return () => clearInterval(timer);
  }, [cutoffTime]);

  return timeRemaining;
};
