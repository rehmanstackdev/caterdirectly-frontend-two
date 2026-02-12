import { useEffect, useState } from 'react';
import { calculateDistance } from '@/utils/location-utils';
import { supabase } from '@/integrations/supabase/client';

interface UseAddressDistanceResult {
  distanceMiles: number | null;
  loading: boolean;
  error: string | null;
}

async function geocodeAddress(address: string) {
  console.log(`[useAddressDistance] Geocoding address: "${address}"`);
  
  const { data, error } = await supabase.functions.invoke('geocoding', {
    body: { type: 'geocode', address }
  });
  
  if (error) {
    console.error(`[useAddressDistance] Supabase function error for "${address}":`, error);
    throw new Error(error.message || 'Geocoding failed');
  }
  
  if (!data) {
    console.error(`[useAddressDistance] No data returned for "${address}"`);
    throw new Error('No data returned from geocoding service');
  }
  
  console.log(`[useAddressDistance] Geocoding response for "${address}":`, {
    status: data.status,
    results_count: data.results?.length || 0,
    error_message: data.error_message
  });
  
  if (data.status !== 'OK') {
    throw new Error(`Geocoding failed for "${address}": ${data.error_message || data.status}`);
  }
  
  return data;
}

// Computes distance in miles between two address strings using Google Geocoding via our Supabase edge function
export const useAddressDistance = (
  originAddress?: string | null,
  destinationAddress?: string | null
): UseAddressDistanceResult => {
  const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const compute = async () => {
      if (!originAddress || !destinationAddress) {
        console.log(`[useAddressDistance] Resetting distance - origin: ${originAddress}, destination: ${destinationAddress}`);
        setDistanceMiles(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`[useAddressDistance] Computing distance from "${originAddress}" to "${destinationAddress}"`);

        // Geocode origin
        const originResp = await geocodeAddress(originAddress);
        const origin = originResp?.results?.[0]?.geometry?.location;
        
        if (!origin) {
          const errorMsg = `Unable to geocode origin address: "${originAddress}"`;
          console.error(`[useAddressDistance] ${errorMsg}`);
          setError(errorMsg);
          setDistanceMiles(null);
          return;
        }

        // Geocode destination
        const destResp = await geocodeAddress(destinationAddress);
        const dest = destResp?.results?.[0]?.geometry?.location;
        
        if (!dest) {
          const errorMsg = `Unable to geocode destination address: "${destinationAddress}"`;
          console.error(`[useAddressDistance] ${errorMsg}`);
          setError(errorMsg);
          setDistanceMiles(null);
          return;
        }

        const miles = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
        
        if (miles === Infinity) {
          const errorMsg = 'Invalid distance calculation result';
          console.error(`[useAddressDistance] ${errorMsg}`);
          setError(errorMsg);
          setDistanceMiles(null);
          return;
        }
        
        console.log(`[useAddressDistance] Distance calculated: ${miles.toFixed(2)} miles`);
        setDistanceMiles(miles);
        
      } catch (e: any) {
        const errorMsg = e?.message || 'Failed to compute distance';
        console.error(`[useAddressDistance] Error:`, errorMsg, e);
        setError(errorMsg);
        setDistanceMiles(null);
      } finally {
        setLoading(false);
      }
    };
    compute();
  }, [originAddress, destinationAddress]);

  return { distanceMiles, loading, error };
};
