import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { getAuthHeader } from '@/utils/utils';

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface Review {
  id: string;
  customer: string;
  event: string;
  date: string;
  rating: number;
  comment: string;
}

export const useVendorReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const response = await fetch(`${API_URL}vendor/reviews`, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status === 200 && result.data) {
          setReviews(result.data);
        }

      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  return {
    reviews,
    loading
  };
};