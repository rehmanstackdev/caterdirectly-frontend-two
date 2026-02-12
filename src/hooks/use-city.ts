import { useEffect, useMemo, useState } from "react";
import { useLocation as useRouterLocation } from "react-router-dom";
import { useLocation as useLocationCtx } from "@/hooks/use-location";

interface GeoInfo {
  city?: string | null;
  region?: string | null;
  label: string; // e.g., "Seattle, WA" or "near you"
  loading: boolean;
}

// Simple sessionStorage cache for reverse geocoding
const cacheKeyFor = (lat: number, lng: number) => `revgeo:${lat.toFixed(3)},${lng.toFixed(3)}`;

async function reverseGeocode(lat: number, lng: number): Promise<{ city?: string | null; state?: string | null } | null> {
  try {
    const key = cacheKeyFor(lat, lng);
    const cached = sessionStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("accept-language", "en");

    const res = await fetch(url.toString(), {
      headers: {
        // Browsers set Referer automatically; Nominatim requests identification via UA or Referer.
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address || {};
    const city = addr.city || addr.town || addr.village || addr.hamlet || addr.borough || addr.county || null;
    const state = addr.state_code || addr.state || addr.region || null;
    const result = { city, state };
    sessionStorage.setItem(key, JSON.stringify(result));
    return result;
  } catch {
    return null;
  }
}

function formatLabel(city?: string | null, region?: string | null): string {
  if (city && region) return `${city}, ${region}`;
  if (city) return city;
  return "near you";
}

export function useGeoCity(): GeoInfo {
  const routerLoc = useRouterLocation();
  const { address, coordinates } = useLocationCtx();

  const params = useMemo(() => new URLSearchParams(routerLoc.search), [routerLoc.search]);
  const cityParam = params.get("city") || params.get("q") || undefined;
  const regionParam = params.get("state") || params.get("region") || params.get("state_code") || undefined;

  const [city, setCity] = useState<string | null | undefined>(cityParam || null);
  const [region, setRegion] = useState<string | null | undefined>(regionParam || null);
  const [loading, setLoading] = useState<boolean>(false);

  // If URL provides city/region, prefer it
  useEffect(() => {
    if (cityParam) setCity(cityParam);
    if (regionParam) setRegion(regionParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityParam, regionParam]);

  // Try to parse from saved address if city not present
  useEffect(() => {
    if (cityParam) return; // already set from URL
    if (!address) return;
    // Attempt to parse "Street, City, ST" or similar
    const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      const maybeCity = parts[parts.length - 2];
      const maybeRegion = parts[parts.length - 1]?.split(" ")[0];
      if (maybeCity && !city) setCity(maybeCity);
      if (maybeRegion && !region) setRegion(maybeRegion);
    } else if (parts.length === 2) {
      const maybeCity = parts[1];
      if (maybeCity && !city) setCity(maybeCity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Reverse geocode if we still don't have city and we have coords
  useEffect(() => {
    if (city || !coordinates?.lat || !coordinates?.lng) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await reverseGeocode(coordinates.lat, coordinates.lng);
      if (!cancelled && res) {
        if (res.city && !city) setCity(res.city);
        if (res.state && !region) setRegion(res.state);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates?.lat, coordinates?.lng]);

  return {
    city: city ?? undefined,
    region: region ?? undefined,
    label: formatLabel(city ?? undefined, region ?? undefined),
    loading,
  };
}
