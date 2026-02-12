import { useState, useEffect } from 'react';

export function useVendorCommission() {
  const [commissionRate, setCommissionRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCommissionRate = () => {
      try {
        // Get commission rate from localStorage user_data
        const userDataStr = localStorage.getItem('user_data');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          const rate = userData.vendor?.commission_rate || userData.vendor?.commissionRate || 0;
          setCommissionRate(rate);
        }
      } catch (error) {
        console.error('Error getting vendor commission rate:', error);
        setCommissionRate(0);
      } finally {
        setLoading(false);
      }
    };

    getCommissionRate();
  }, []);

  return { commissionRate, loading };
}
