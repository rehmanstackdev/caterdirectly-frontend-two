import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UnifiedEntity, UnifiedFilters } from '@/types/crm-types';
import type { PlatformUser } from '@/types/user';
import type { UserRole } from '@/types/supabase-types';
import { useBackendUnifiedEntities, useBackendEntityCounts } from '@/hooks/use-backend-unified-entities';

// Fetch unified leads and users for the combined view
export function useUnifiedEntities(filters: UnifiedFilters) {
  return useBackendUnifiedEntities(filters);
}

// Get entity counts for filters
export function useEntityCounts() {
  return useBackendEntityCounts();
}