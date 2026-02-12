import { useState } from 'react';
import { ServiceType } from '@/types/service-types';

interface Recommendation {
  serviceType: ServiceType;
  description: string;
}

export const useAIEventPlanner = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateRecommendation = async (eventType: string, guest_count: number, budget: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Build service type recommendations based on event type
      let serviceTypes = ['catering']; // Always include catering
      
      if (eventType === 'wedding' || eventType === 'corporate' || eventType === 'conference') {
        serviceTypes.push('venues');
      }
      
      if (eventType === 'birthday' || eventType === 'celebration' || eventType === 'wedding') {
        serviceTypes.push('party-rentals');
      }
      
      if (guest_count > 75 || eventType === 'corporate' || eventType === 'wedding') {
        serviceTypes.push('staff');
      }
      
      // Generate descriptions based on service types
      const newRecommendations: Recommendation[] = serviceTypes.map(type => {
        switch (type) {
          case 'catering':
            return {
              serviceType: 'catering',
              description: `Recommended catering services for a ${eventType} event with ${guest_count} guests and a budget of $${budget}.`
            };
          case 'venues':
            return {
              serviceType: 'venues',
              description: `Recommended venue options for a ${eventType} event with ${guest_count} guests and a budget of $${budget}.`
            };
          case 'party-rentals':
            return {
              serviceType: 'party-rentals',
              description: `Recommended party rental services for a ${eventType} event with ${guest_count} guests and a budget of $${budget}.`
            };
          case 'staff':
            return {
              serviceType: 'staff',
              description: `Recommended staffing services for a ${eventType} event with ${guest_count} guests and a budget of $${budget}.`
            };
          default:
            return {
              serviceType: 'catering',
              description: `Recommended catering services for a ${eventType} event with ${guest_count} guests and a budget of $${budget}.`
            };
        }
      });
      
      setRecommendations(newRecommendations);
    } catch (err) {
      console.error("AI Event Planner Error:", err);
      setError("Failed to generate event recommendations. Please try again.");
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { recommendations, isLoading, error, generateRecommendation };
};
