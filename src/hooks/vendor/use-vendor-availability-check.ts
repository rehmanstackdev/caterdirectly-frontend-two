import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check vendor availability based on blocked dates and weekly schedule
 * This is the single source of truth for availability validation
 */
export function useVendorAvailabilityCheck() {
  
  /**
   * Check if a single vendor is available on a specific date/time
   */
  const checkVendorAvailability = async (
    vendorId: string,
    eventDate: string, // YYYY-MM-DD format
    eventTime?: string // HH:MM format (optional)
  ): Promise<{
    available: boolean;
    reason?: string;
    vendorName?: string;
  }> => {
    try {
      // Step 1: Get vendor name for error messages
      const { data: vendor } = await supabase
        .from('vendors')
        .select('company_name')
        .eq('id', vendorId)
        .single();
      
      const vendorName = vendor?.company_name || 'Unknown Vendor';
      
      // Step 2: Check blocked dates
      const { data: blockedDates } = await supabase
        .from('vendor_blocked_dates')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('blocked_date', eventDate);
      
      if (blockedDates && blockedDates.length > 0) {
        const block = blockedDates[0];
        
        if (block.type === 'full_day') {
          return {
            available: false,
            reason: block.reason || 'Unavailable on this date',
            vendorName
          };
        }
        
        // If partial day block and time provided, check time overlap
        if (block.type === 'partial' && eventTime && block.start_time && block.end_time) {
          if (isTimeInRange(eventTime, block.start_time, block.end_time)) {
            return {
              available: false,
              reason: `Unavailable ${block.start_time}-${block.end_time}: ${block.reason || 'Blocked time'}`,
              vendorName
            };
          }
        }
      }
      
      // Step 3: Check day-of-week availability rules
      const dayOfWeek = new Date(eventDate + 'T00:00:00').getDay();
      
      const { data: rules } = await supabase
        .from('vendor_availability_rules')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('day_of_week', dayOfWeek)
        .single();
      
      if (rules) {
        if (!rules.is_available) {
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return {
            available: false,
            reason: `Closed on ${dayNames[dayOfWeek]}s`,
            vendorName
          };
        }
        
        // If time provided, check if within business hours
        if (eventTime && rules.start_time && rules.end_time) {
          if (!isTimeInRange(eventTime, rules.start_time, rules.end_time)) {
            return {
              available: false,
              reason: `Outside business hours (${rules.start_time}-${rules.end_time})`,
              vendorName
            };
          }
        }
      }
      
      return { available: true, vendorName };
    } catch (error) {
      console.error('Error checking vendor availability:', error);
      return {
        available: true, // Fail open to allow booking if check fails
        vendorName: 'Unknown Vendor'
      };
    }
  };
  
  /**
   * Check multiple vendors at once
   */
  const checkMultipleVendorsAvailability = async (
    vendorIds: string[],
    eventDate: string,
    eventTime?: string
  ): Promise<{
    allAvailable: boolean;
    unavailableVendors: Array<{
      vendorId: string;
      vendorName: string;
      reason: string;
    }>;
  }> => {
    const results = await Promise.all(
      vendorIds.map(id => checkVendorAvailability(id, eventDate, eventTime))
    );
    
    const unavailable = results
      .map((result, index) => ({
        vendorId: vendorIds[index],
        vendorName: result.vendorName || 'Unknown Vendor',
        reason: result.reason || 'Unavailable',
        available: result.available
      }))
      .filter(r => !r.available);
    
    return {
      allAvailable: unavailable.length === 0,
      unavailableVendors: unavailable
    };
  };
  
  /**
   * Get all blocked dates for specific vendors (for calendar UI)
   */
  const getBlockedDates = async (vendorIds: string[]): Promise<Set<string>> => {
    const blockedDatesSet = new Set<string>();
    
    try {
      const { data } = await supabase
        .from('vendor_blocked_dates')
        .select('blocked_date')
        .in('vendor_id', vendorIds)
        .eq('type', 'full_day');
      
      data?.forEach(block => blockedDatesSet.add(block.blocked_date));
      
      return blockedDatesSet;
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
      return new Set();
    }
  };
  
  /**
   * Get closed days of week for specific vendors
   */
  const getClosedDays = async (vendorIds: string[]): Promise<Set<number>> => {
    const closedDaysSet = new Set<number>();
    
    try {
      const { data } = await supabase
        .from('vendor_availability_rules')
        .select('day_of_week')
        .in('vendor_id', vendorIds)
        .eq('is_available', false);
      
      data?.forEach(rule => closedDaysSet.add(rule.day_of_week));
      
      return closedDaysSet;
    } catch (error) {
      console.error('Error fetching closed days:', error);
      return new Set();
    }
  };
  
  return {
    checkVendorAvailability,
    checkMultipleVendorsAvailability,
    getBlockedDates,
    getClosedDays
  };
}

// Helper function to check if time is within a range
function isTimeInRange(checkTime: string, startTime: string, endTime: string): boolean {
  const check = timeToMinutes(checkTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return check >= start && check <= end;
}

// Convert HH:MM to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
