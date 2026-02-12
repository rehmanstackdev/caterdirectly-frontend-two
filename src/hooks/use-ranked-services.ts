import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceItem } from '@/types/service-types';

interface UseRankedServicesProps {
  serviceType?: string;
  location?: string;
  limit?: number;
  userLocation?: string;
}

export function useRankedServices({
  serviceType,
  location,
  limit = 20,
  userLocation
}: UseRankedServicesProps) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankedServices = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, update performance scores for all vendors
        await supabase.rpc('update_all_service_rankings');

        // Build the query with ranking
        let query = supabase
          .from('services')
          .select(`
            *,
            vendors!inner(
              id,
              company_name,
              is_managed,
              performance_score,
              boost_commission_rate
            )
          `)
          .eq('status', 'approved')
          .eq('active', true);

        // Apply filters
        if (serviceType) {
          query = query.eq('type', serviceType);
        }

        if (location) {
          query = query.ilike('location', `%${location}%`);
        }

        // Get services first
        const { data: servicesData, error: servicesError } = await query;

        if (servicesError) {
          throw servicesError;
        }

        if (!servicesData) {
          setServices([]);
          return;
        }

        // Calculate ranking scores for each service
        const servicesWithScores = await Promise.all(
          servicesData.map(async (service) => {
            const { data: score } = await supabase.rpc(
              'calculate_service_ranking_score',
              {
                service_id_param: service.id,
                user_location: userLocation || null
              }
            );

            return {
              ...service,
              ranking_score: score || 0,
              vendorName: service.vendors?.company_name || service.vendor_name,
              isManaged: service.vendors?.is_managed || service.is_managed,
              performance_score: service.vendors?.performance_score || 0,
              boost_commission_rate: service.vendors?.boost_commission_rate || 0
            };
          })
        );

        // Sort by ranking score (highest first)
        const rankedServices = servicesWithScores
          .sort((a, b) => (b.ranking_score || 0) - (a.ranking_score || 0))
          .slice(0, limit);

        setServices(rankedServices as ServiceItem[]);
      } catch (err) {
        console.error('Error fetching ranked services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchRankedServices();
  }, [serviceType, location, limit, userLocation]);

  return { services, loading, error, refetch: () => setLoading(true) };
}