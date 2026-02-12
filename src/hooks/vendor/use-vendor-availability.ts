import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useVendorData } from './use-vendor-data';
import VendorAvailabilityService from '@/services/api/vendorAvailability.service';
import VendorBlockDatesService from '@/services/api/vendorBlockDates.service';

interface AvailabilityRule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_orders_per_day?: number;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string;
  type: 'full_day' | 'partial';
  start_time?: string;
  end_time?: string;
}

interface BlockDateData {
  date: Date;
  reason: string;
  type: 'full_day' | 'partial';
  startTime?: string;
  endTime?: string;
}

const dayNameToNumber: Record<string, number> = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
  'Thursday': 4, 'Friday': 5, 'Saturday': 6
};

const dayNumberToName: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday'
};

export const useVendorAvailability = (vendorIdOverride?: string) => {
  const { vendorData } = useVendorData();
  const effectiveVendorId = vendorIdOverride || vendorData?.id;
  const [availabilityRules, setAvailabilityRules] = useState<AvailabilityRule[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch availability rules
  const fetchAvailabilityRules = async () => {
    if (!effectiveVendorId) {
      console.log('No vendor ID available');
      return;
    }

    try {
      console.log('Fetching availability for vendor:', effectiveVendorId);
      const data = await VendorAvailabilityService.getByVendorId(effectiveVendorId);
      console.log('Received availability data:', data);
      
      const rules = data.map(item => ({
        id: item.id,
        day_of_week: dayNameToNumber[item.day],
        start_time: item.startTime,
        end_time: item.endTime,
        is_available: item.status === 'available',
        max_orders_per_day: item.maxOrdersPerDay
      }));
      setAvailabilityRules(rules.sort((a, b) => a.day_of_week - b.day_of_week));
    } catch (error) {
      console.error('Error fetching availability rules:', error);
    }
  };

  // Fetch blocked dates
  const fetchBlockedDates = async () => {
    if (!effectiveVendorId) return;

    try {
      const data = await VendorBlockDatesService.getByVendorId(effectiveVendorId);
      const dates = data.map(item => ({
        id: item.id,
        blocked_date: item.date,
        reason: item.reason,
        type: item.status === 'full' ? 'full_day' as const : 'partial' as const,
        start_time: item.startTime,
        end_time: item.endTime
      }));
      setBlockedDates(dates);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  // Update availability rule
  const updateAvailabilityRule = async (ruleId: string, updates: Partial<AvailabilityRule>) => {
    try {
      const apiUpdates: any = {};
      if (updates.start_time) apiUpdates.startTime = updates.start_time;
      if (updates.end_time) apiUpdates.endTime = updates.end_time;
      if (updates.is_available !== undefined) apiUpdates.status = updates.is_available ? 'available' : 'closed';
      if (updates.day_of_week !== undefined) apiUpdates.day = dayNumberToName[updates.day_of_week];
      if (updates.max_orders_per_day !== undefined) apiUpdates.maxOrdersPerDay = updates.max_orders_per_day;

      await VendorAvailabilityService.update(ruleId, apiUpdates);
      
      setAvailabilityRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ));

      toast({
        title: "Updated",
        description: "Availability updated successfully"
      });
      return true;
    } catch (error) {
      console.error('Error updating availability rule:', error);
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Add availability rule
  const addAvailabilityRule = async (rule: Omit<AvailabilityRule, 'id'>) => {
    if (!effectiveVendorId) return false;

    try {
      const data = await VendorAvailabilityService.create({
        vendorId: effectiveVendorId,
        day: dayNumberToName[rule.day_of_week],
        startTime: rule.start_time,
        endTime: rule.end_time,
        status: rule.is_available ? 'available' : 'closed',
        maxOrdersPerDay: rule.max_orders_per_day
      });

      const newRule = {
        id: data.id,
        day_of_week: dayNameToNumber[data.day],
        start_time: data.startTime,
        end_time: data.endTime,
        is_available: data.status === 'available',
        max_orders_per_day: data.maxOrdersPerDay
      };

      setAvailabilityRules(prev => [...prev, newRule].sort((a, b) => a.day_of_week - b.day_of_week));
      
      toast({
        title: "Added",
        description: "Day availability added successfully"
      });
      return true;
    } catch (error) {
      console.error('Error adding availability rule:', error);
      toast({
        title: "Error",
        description: "Failed to add availability. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Delete availability rule
  const deleteAvailabilityRule = async (ruleId: string) => {
    try {
      await VendorAvailabilityService.deleteAvailability(ruleId);
      setAvailabilityRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      toast({
        title: "Deleted",
        description: "Availability rule deleted successfully"
      });
      return true;
    } catch (error) {
      console.error('Error deleting availability rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete availability. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Block a date
  const blockDate = async (blockData: BlockDateData) => {
    if (!effectiveVendorId) return false;

    try {
      const year = blockData.date.getFullYear();
      const month = String(blockData.date.getMonth() + 1).padStart(2, '0');
      const day = String(blockData.date.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;

      await VendorBlockDatesService.create({
        vendorId: effectiveVendorId,
        date: localDate,
        reason: blockData.reason,
        status: blockData.type === 'full_day' ? 'full' : 'partial',
        startTime: blockData.startTime,
        endTime: blockData.endTime
      });

      toast({
        title: "Date Blocked",
        description: `${blockData.date.toLocaleDateString()} has been blocked`
      });

      await fetchBlockedDates();
      return true;
    } catch (error) {
      console.error('Error blocking date:', error);
      toast({
        title: "Error",
        description: "Failed to block date. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Remove blocked date
  const removeBlockedDate = async (blockId: string) => {
    try {
      await VendorBlockDatesService.deleteBlockDate(blockId);
      
      toast({
        title: "Block Removed",
        description: "Date is now available for orders"
      });

      await fetchBlockedDates();
      return true;
    } catch (error) {
      console.error('Error removing blocked date:', error);
      toast({
        title: "Error",
        description: "Failed to remove block. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Initialize data
  useEffect(() => {
    if (effectiveVendorId) {
      setLoading(true);
      Promise.all([fetchAvailabilityRules(), fetchBlockedDates()])
        .finally(() => setLoading(false));
    }
  }, [effectiveVendorId]);

  // Update blocked date
  const updateBlockedDate = async (blockId: string, updates: Partial<BlockDateData>) => {
    try {
      const apiUpdates: any = {};
      if (updates.date) {
        const year = updates.date.getFullYear();
        const month = String(updates.date.getMonth() + 1).padStart(2, '0');
        const day = String(updates.date.getDate()).padStart(2, '0');
        apiUpdates.date = `${year}-${month}-${day}`;
      }
      if (updates.reason) apiUpdates.reason = updates.reason;
      if (updates.type) apiUpdates.status = updates.type === 'full_day' ? 'full' : 'partial';
      if (updates.startTime) apiUpdates.startTime = updates.startTime;
      if (updates.endTime) apiUpdates.endTime = updates.endTime;

      await VendorBlockDatesService.update(blockId, apiUpdates);
      
      toast({
        title: "Updated",
        description: "Block date updated successfully"
      });

      await fetchBlockedDates();
      return true;
    } catch (error) {
      console.error('Error updating block date:', error);
      toast({
        title: "Error",
        description: "Failed to update block date. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    availabilityRules,
    blockedDates,
    loading,
    updateAvailabilityRule,
    addAvailabilityRule,
    deleteAvailabilityRule,
    blockDate,
    removeBlockedDate,
    updateBlockedDate,
    refetch: () => {
      fetchAvailabilityRules();
      fetchBlockedDates();
    }
  };
};
