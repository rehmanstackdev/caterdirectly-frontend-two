import { useEffect, useRef, useCallback, startTransition, useDeferredValue } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { logger } from '@/utils/logger';

interface UseFormAutoSaveProps<T> {
  formData: T;
  onSave: (data: T) => void | Promise<void>;
  debounceMs?: number;
  storageKey?: string;
  enabled?: boolean;
  validationSchema?: z.ZodSchema<T>;
  maxRetries?: number;
  retryDelay?: number;
}

export const useFormAutoSave = <T extends Record<string, any>>({
  formData,
  onSave,
  debounceMs = 2000,
  storageKey,
  enabled = true,
  validationSchema,
  maxRetries = 3,
  retryDelay = 1000
}: UseFormAutoSaveProps<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isSavingRef = useRef(false);
  const retryCountRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Use deferred value for expensive validations (React 18+)
  const deferredFormData = useDeferredValue(formData);

  // Enhanced save to localStorage with validation and error handling
  const saveToStorage = useCallback((data: T) => {
    if (!storageKey) return;
    
    const startTime = Date.now();
    try {
      // Validate data before storage if schema provided
      if (validationSchema) {
        const result = validationSchema.safeParse(data);
        if (!result.success) {
          logger.dataValidation(`localStorage-${storageKey}`, false, result.error.errors.map(e => e.message));
          return false;
        }
        logger.dataValidation(`localStorage-${storageKey}`, true);
      }

      const storageData = {
        data,
        timestamp: Date.now(),
        version: 1,
        checksum: btoa(JSON.stringify(data)).slice(0, 10) // Simple integrity check
      };

      localStorage.setItem(storageKey, JSON.stringify(storageData));
      logger.persistenceSuccess(`localStorage-${storageKey}`, Date.now() - startTime, data);
      return true;
    } catch (error) {
      logger.persistenceFailure(`localStorage-${storageKey}`, error as Error, 1, false);
      return false;
    }
  }, [storageKey, validationSchema]);

  // Enhanced load from localStorage with integrity checks and recovery
  const loadFromStorage = useCallback((): T | null => {
    if (!storageKey) return null;
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        logger.dataRecovery(`localStorage-${storageKey}`, false, false);
        return null;
      }
      
      const parsed = JSON.parse(saved);
      
      // Handle legacy format (without version/checksum)
      if (!parsed.version) {
        logger.dataRecovery(`localStorage-${storageKey}`, true, false);
        return parsed.data || parsed;
      }

      const { data, timestamp, checksum } = parsed;
      
      // Check data integrity
      const currentChecksum = btoa(JSON.stringify(data)).slice(0, 10);
      const corruptionDetected = checksum !== currentChecksum;
      
      if (corruptionDetected) {
        logger.dataRecovery(`localStorage-${storageKey}`, true, true);
        localStorage.removeItem(storageKey);
        return null;
      }
      
      // Check if data is older than 24 hours
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        logger.dataRecovery(`localStorage-${storageKey}`, true, false);
        localStorage.removeItem(storageKey);
        return null;
      }

      // Validate loaded data if schema provided
      if (validationSchema) {
        const result = validationSchema.safeParse(data);
        if (!result.success) {
          logger.dataValidation(`localStorage-${storageKey}-load`, false, result.error.errors.map(e => e.message));
          localStorage.removeItem(storageKey);
          return null;
        }
        logger.dataValidation(`localStorage-${storageKey}-load`, true);
      }
      
      logger.dataRecovery(`localStorage-${storageKey}`, false, false);
      return data;
    } catch (error) {
      logger.persistenceFailure(`localStorage-${storageKey}-load`, error as Error, 1, false);
      // Try to clear corrupted data
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      return null;
    }
  }, [storageKey, validationSchema]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Enhanced save operation with retry logic
  const performSave = useCallback(async (data: T, attempt: number = 1) => {
    if (isSavingRef.current) return;
    
    const currentDataString = JSON.stringify(data);
    if (currentDataString === lastSavedRef.current) return;
    
    const startTime = Date.now();
    
    try {
      isSavingRef.current = true;
      
      // Save to localStorage first (fast operation)
      const localStorageSuccess = saveToStorage(data);
      
      // Then save to database (slower operation) using React 18+ startTransition
      await new Promise<void>((resolve, reject) => {
        startTransition(() => {
          Promise.resolve(onSave(data))
            .then(() => resolve())
            .catch(reject);
        });
      });
      
      retryCountRef.current = 0;
      lastSavedRef.current = currentDataString;
      logger.persistenceSuccess('combined-save', Date.now() - startTime, data);
      
    } catch (error) {
      const shouldRetry = attempt <= maxRetries;
      logger.persistenceFailure('combined-save', error as Error, attempt, shouldRetry);
      
      if (shouldRetry) {
        const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.persistenceRetry('combined-save', attempt, delay);
        
        setTimeout(() => {
          performSave(data, attempt + 1);
        }, delay);
      } else {
        // Only show error toast after all retries failed
        toast.error('Failed to auto-save form data after multiple attempts');
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave, saveToStorage, maxRetries, retryDelay]);

  // Enhanced debounced save effect with deferred validation
  useEffect(() => {
    if (!enabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performSave(deferredFormData);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [deferredFormData, debounceMs, enabled, performSave]);

  // Background sync between localStorage and database every 30 seconds
  useEffect(() => {
    if (!enabled || !storageKey) return;

    const syncInterval = setInterval(() => {
      const localData = loadFromStorage();
      if (localData && JSON.stringify(localData) !== lastSavedRef.current) {
        // Silent background sync without showing errors to user
        startTransition(() => {
          Promise.resolve(onSave(localData)).catch(error => {
            logger.persistenceFailure('background-sync', error, 1, false);
          });
        });
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [enabled, storageKey, loadFromStorage, onSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    loadFromStorage,
    clearSavedData,
    isSaving: isSavingRef.current,
    getMetrics: () => logger.getMetrics(),
    resetMetrics: () => logger.resetMetrics()
  };
};