
import { ServiceSelection } from "@/types/order";
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { safeGetItem, safeSetStorageItem, removeFromBothStorages } from '@/utils/storage-utils';
import { progressiveCleanup } from '@/utils/storage-manager';

interface BookingStateBackup {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  timestamp: number;
  version?: number;
  checksum?: string;
}

// Validation schema for booking state
const BookingStateSchema = z.object({
  selectedServices: z.array(z.any()),
  selectedItems: z.record(z.number()),
  formData: z.any(),
  timestamp: z.number(),
  version: z.number().optional(),
  checksum: z.string().optional()
});

const BOOKING_STATE_KEY = 'booking-state-backup';
const STATE_EXPIRY_TIME = 4 * 60 * 60 * 1000; // 4 hours for complex orders

export const saveBookingStateBackup = (
  selectedServices: ServiceSelection[],
  selectedItems: Record<string, number>,
  formData: any
) => {
  const startTime = Date.now();
  logger.log('📝 BookingPersistence: Saving backup with formData:', formData);
  
  try {
    // Validate and sanitize service details before saving
    const validatedServices = selectedServices.map(service => {
      if (service.service_details && service.service_details._type === "undefined" && service.service_details.value === "undefined") {
        logger.warn('📝 BookingPersistence: Cleaning malformed service_details for:', service.name);
        return {
          ...service,
          service_details: null // Clear malformed data
        };
      }
      return service;
    });

    // Create a leaner representation to avoid storage quota issues (SSOT is DB)  
    // Keep the full service object but mark it as from backup
    const persistedServices = validatedServices.map(s => ({
      ...s,
      _fromBackup: true // Mark as backup so we know not to validate service_details
    }));

    const backup: BookingStateBackup = {
      selectedServices: persistedServices as any,
      selectedItems,
      formData,
      timestamp: Date.now(),
      version: 1,
      // Use encodeURIComponent instead of btoa to handle special characters
      checksum: encodeURIComponent(JSON.stringify({ selectedServices: persistedServices, selectedItems, formData })).slice(0, 10)
    };

    // Validate backup structure
    const validation = BookingStateSchema.safeParse(backup);
    if (!validation.success) {
      logger.dataValidation('booking-state-backup', false, validation.error.errors.map(e => e.message));
      return false;
    }

    const serialized = JSON.stringify(backup);
    const stored = safeSetStorageItem(BOOKING_STATE_KEY, serialized);
    if (!stored) {
      try { progressiveCleanup(); } catch {}
      const retry = safeSetStorageItem(BOOKING_STATE_KEY, serialized);
      if (!retry) {
        logger.persistenceFailure('booking-state-backup', new Error('QuotaExceededError'), 1, false);
        return false;
      }
    }
    logger.persistenceSuccess('booking-state-backup', Date.now() - startTime, { ...backup, selectedServicesCount: (backup.selectedServices || []).length });
    return true;
  } catch (error) {
    logger.persistenceFailure('booking-state-backup', error as Error, 1, false);
    return false;
  }
};

export const loadBookingStateBackup = (): BookingStateBackup | null => {
  try {
    const saved = safeGetItem(BOOKING_STATE_KEY);
    if (!saved) {
      logger.dataRecovery('booking-state-backup', false, false);
      return null;
    }
    
    const parsed = JSON.parse(saved);
    
    // Handle legacy format (without version/checksum)
    if (!parsed.version) {
      logger.dataRecovery('booking-state-backup', true, false);
      // Migrate to new format
      const migrated: BookingStateBackup = {
        ...parsed,
        version: 1,
        checksum: encodeURIComponent(JSON.stringify({
          selectedServices: parsed.selectedServices,
          selectedItems: parsed.selectedItems,
          formData: parsed.formData
        })).slice(0, 10)
      };
      
      // Save migrated version
      try {
        safeSetStorageItem(BOOKING_STATE_KEY, JSON.stringify(migrated));
      } catch {}
      
      return migrated;
    }

    const backup: BookingStateBackup = parsed;
    
    // Check data integrity
    const expectedChecksum = encodeURIComponent(JSON.stringify({
      selectedServices: backup.selectedServices,
      selectedItems: backup.selectedItems,
      formData: backup.formData
    })).slice(0, 10);
    
    if (backup.checksum && backup.checksum !== expectedChecksum) {
      logger.dataRecovery('booking-state-backup', true, true);
      removeFromBothStorages(BOOKING_STATE_KEY);
      return null;
    }
    
    // Check if backup is expired
    if (Date.now() - backup.timestamp > STATE_EXPIRY_TIME) {
      logger.dataRecovery('booking-state-backup', true, false);
      removeFromBothStorages(BOOKING_STATE_KEY);
      return null;
    }

    // Validate backup structure
    const validation = BookingStateSchema.safeParse(backup);
    if (!validation.success) {
      logger.dataValidation('booking-state-backup-load', false, validation.error.errors.map(e => e.message));
      removeFromBothStorages(BOOKING_STATE_KEY);
      return null;
    }
    
    logger.dataRecovery('booking-state-backup', false, false);
    logger.log('📝 BookingPersistence: Loaded booking state backup with formData:', backup.formData);
    return backup;
  } catch (error) {
    logger.persistenceFailure('booking-state-backup-load', error as Error, 1, false);
    // Clear corrupted data
    try {
      removeFromBothStorages(BOOKING_STATE_KEY);
    } catch {}
    return null;
  }
};

export const clearBookingStateBackup = () => {
  try {
    removeFromBothStorages(BOOKING_STATE_KEY);
    logger.log('[BookingPersistence] Cleared booking state backup');
  } catch (error) {
    logger.persistenceFailure('booking-state-clear', error as Error, 1, false);
  }
};

export const mergeSelectedItems = (
  existing: Record<string, number>,
  backup: Record<string, number>
): Record<string, number> => {
  try {
    // Validate input data
    if (typeof existing !== 'object' || typeof backup !== 'object') {
      logger.warn('[BookingPersistence] Invalid data types for merge, using fallback');
      return existing || {};
    }

    // Merge backup into existing, preferring existing values for conflicts
    const merged = { ...backup, ...existing };
    
    // Validate merged result
    const isValid = Object.values(merged).every(val => typeof val === 'number' && val >= 0);
    if (!isValid) {
      logger.warn('[BookingPersistence] Invalid numbers detected in merge, filtering');
      Object.keys(merged).forEach(key => {
        if (typeof merged[key] !== 'number' || merged[key] < 0) {
          delete merged[key];
        }
      });
    }
    
    logger.log('[BookingPersistence] Merged selectedItems:', { existing, backup, merged });
    return merged;
  } catch (error) {
    logger.persistenceFailure('selectedItems-merge', error as Error, 1, false);
    return existing || {};
  }
};
