
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, X, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVendorAvailability } from '@/hooks/vendor/use-vendor-availability';
import {
  AddAvailabilityModal,
  EditAvailabilityModal,
  DeleteAvailabilityModal,
  BlockDateModal,
  EditBlockDateModal,
  DeleteBlockDateModal,
} from '@/components/vendor/calendar/AvailabilityModals';

interface AvailabilityManagerProps {
  vendorId?: string;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const { 
    availabilityRules: fetchedRules, 
    blockedDates, 
    loading, 
    updateAvailabilityRule,
    addAvailabilityRule,
    deleteAvailabilityRule,
    blockDate, 
    removeBlockedDate,
    updateBlockedDate
  } = useVendorAvailability(vendorId);
  
  const availabilityRules = fetchedRules;
  
  const [isBlockingOpen, setIsBlockingOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditBlockOpen, setIsEditBlockOpen] = useState(false);
  const [isDeleteBlockOpen, setIsDeleteBlockOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRule, setNewRule] = useState({
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true,
    max_orders_per_day: undefined as number | undefined
  });
  const [blockData, setBlockData] = useState({
    date: undefined as Date | undefined,
    reason: '',
    type: 'full_day' as const,
    startTime: '',
    endTime: ''
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (time24: string): string => {
    if (!time24) return '';
    
    // Handle formats like "09:00:00" or "09:00"
    const parts = time24.split(':');
    const hours = parts[0];
    const minutes = parts[1] || '00';
    
    const hour24 = parseInt(hours, 10);
    
    if (isNaN(hour24)) return time24;
    
    let hour12 = hour24;
    let period = 'AM';
    
    if (hour24 === 0) {
      hour12 = 12;
      period = 'AM';
    } else if (hour24 === 12) {
      hour12 = 12;
      period = 'PM';
    } else if (hour24 > 12) {
      hour12 = hour24 - 12;
      period = 'PM';
    }
    
    return `${hour12}:${minutes} ${period}`;
  };

  const isDateAlreadyBlocked = () => {
    if (!blockData.date) return false;
    const year = blockData.date.getFullYear();
    const month = String(blockData.date.getMonth() + 1).padStart(2, '0');
    const day = String(blockData.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return blockedDates.some(block => block.blocked_date === dateStr);
  };

  const isBlockDateInvalid = () => {
    if (!blockData.date || !blockData.reason) return true;
    if (isDateAlreadyBlocked()) return true;
    if (blockData.type === 'partial') {
      if (!blockData.startTime || !blockData.endTime) return true;
      if (blockData.startTime >= blockData.endTime) return true;
    }
    return false;
  };

  const isEditBlockInvalid = () => {
    if (!editingBlock) return false;
    if (editingBlock.type === 'partial') {
      if (!editingBlock.startTime || !editingBlock.endTime) return true;
      if (editingBlock.startTime >= editingBlock.endTime) return true;
    }
    return false;
  };

  const handleBlockDate = async () => {
    setIsSubmitting(true);
    const success = await blockDate(blockData);
    setIsSubmitting(false);
    if (success) {
      setBlockData({ date: undefined, reason: '', type: 'full_day', startTime: '', endTime: '' });
      setIsBlockingOpen(false);
    }
  };

  const handleRemoveBlock = async () => {
    if (deletingBlockId) {
      setIsSubmitting(true);
      await removeBlockedDate(deletingBlockId);
      setIsSubmitting(false);
      setIsDeleteBlockOpen(false);
      setDeletingBlockId(null);
    }
  };

  const openDeleteBlockDialog = (blockId: string) => {
    setDeletingBlockId(blockId);
    setIsDeleteBlockOpen(true);
  };

  const handleEditBlock = (block: any) => {
    setEditingBlock({
      id: block.id,
      date: new Date(block.blocked_date),
      reason: block.reason,
      type: block.type,
      startTime: block.start_time || '',
      endTime: block.end_time || ''
    });
    setIsEditBlockOpen(true);
  };

  const handleSaveBlockEdit = async () => {
    if (editingBlock) {
      setIsSubmitting(true);
      const success = await updateBlockedDate(editingBlock.id, {
        date: editingBlock.date,
        reason: editingBlock.reason,
        type: editingBlock.type,
        startTime: editingBlock.startTime,
        endTime: editingBlock.endTime
      });
      setIsSubmitting(false);
      if (success) {
        setIsEditBlockOpen(false);
        setEditingBlock(null);
      }
    }
  };

  const toggleDayAvailability = async (ruleId: string) => {
    const rule = availabilityRules.find(r => r.id === ruleId);
    if (rule) {
      await updateAvailabilityRule(ruleId, { is_available: !rule.is_available });
    }
  };

  const updateDayHours = async (ruleId: string, field: 'start_time' | 'end_time', value: string) => {
    await updateAvailabilityRule(ruleId, { [field]: value });
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingRule) {
      setIsSubmitting(true);
      await updateAvailabilityRule(editingRule.id, {
        start_time: editingRule.start_time,
        end_time: editingRule.end_time,
        is_available: editingRule.is_available,
        max_orders_per_day: editingRule.max_orders_per_day
      });
      setIsSubmitting(false);
      setIsEditOpen(false);
      setEditingRule(null);
    }
  };

  const handleDeleteRule = async () => {
    if (deletingRuleId) {
      setIsSubmitting(true);
      await deleteAvailabilityRule(deletingRuleId);
      setIsSubmitting(false);
      setIsDeleteOpen(false);
      setDeletingRuleId(null);
    }
  };

  const openDeleteDialog = (ruleId: string) => {
    setDeletingRuleId(ruleId);
    setIsDeleteOpen(true);
  };

  const handleAddRule = async () => {
    setIsSubmitting(true);
    const success = await addAvailabilityRule(newRule);
    setIsSubmitting(false);
    if (success) {
      setIsAddOpen(false);
      setNewRule({
        day_of_week: 0,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        max_orders_per_day: undefined
      });
    }
  };

  const getAvailableDays = () => {
    const existingDays = availabilityRules.map(r => r.day_of_week);
    return [0, 1, 2, 3, 4, 5, 6].filter(day => !existingDays.includes(day));
  };

  const isAllDaysAdded = availabilityRules.length >= 7;

  const handleOpenAddDialog = () => {
    const availableDays = getAvailableDays();
    if (availableDays.length > 0) {
      setNewRule({
        day_of_week: availableDays[0],
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        max_orders_per_day: undefined
      });
    }
    setIsAddOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Availability
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Set your regular business hours for each day of the week
            </p>
          </div>
          <Button
            size="sm"
            disabled={isAllDaysAdded}
            onClick={handleOpenAddDialog}
            className="w-full sm:w-auto bg-[#F07712] hover:bg-[#F07712]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Day
          </Button>
        </CardHeader>
        <AddAvailabilityModal
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          isSubmitting={isSubmitting}
          newRule={newRule}
          setNewRule={setNewRule}
          dayNames={dayNames}
          availableDays={getAvailableDays()}
          onSubmit={handleAddRule}
        />
        <CardContent className="pt-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
            </div>
          ) : availabilityRules.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No availability set yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Day" to set your business hours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availabilityRules.map((rule) => (
                <div key={rule.id} className="flex flex-col gap-4 p-4 border rounded-xl bg-white hover:border-[#F07712]/40 hover:shadow-sm transition-colors sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="font-semibold text-slate-900">{dayNames[rule.day_of_week]}</div>
                    {rule.is_available && (
                      <div className="text-sm text-slate-600">
                        {formatTimeTo12Hour(rule.start_time)} - {formatTimeTo12Hour(rule.end_time)}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        className={rule.is_available 
                          ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                        }
                      >
                        {rule.is_available ? 'Available' : 'Closed'}
                      </Badge>
                      {rule.is_available && rule.max_orders_per_day !== undefined && rule.max_orders_per_day !== null && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Accept Order Per Day: {rule.max_orders_per_day}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRule(rule)}
                      className="border-[#F07712] text-[#F07712] hover:bg-[#F07712] hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(rule.id)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Blocked Dates</CardTitle>
            <p className="text-sm text-muted-foreground">
              Block specific dates when you're not available for new orders
            </p>
          </div>
          <Button
            onClick={() => setIsBlockingOpen(true)}
            className="w-full sm:w-auto bg-[#F07712] hover:bg-[#F07712]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Block Date
          </Button>
        </CardHeader>
        <BlockDateModal
          open={isBlockingOpen}
          onOpenChange={setIsBlockingOpen}
          isSubmitting={isSubmitting}
          blockData={blockData}
          setBlockData={setBlockData}
          onSubmit={handleBlockDate}
          isInvalid={isBlockDateInvalid()}
        />

        <EditAvailabilityModal
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          isSubmitting={isSubmitting}
          editingRule={editingRule}
          setEditingRule={setEditingRule}
          dayNames={dayNames}
          onSubmit={handleSaveEdit}
        />

        <DeleteAvailabilityModal
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          isSubmitting={isSubmitting}
          onConfirm={handleDeleteRule}
        />

        <EditBlockDateModal
          open={isEditBlockOpen}
          onOpenChange={setIsEditBlockOpen}
          isSubmitting={isSubmitting}
          editingBlock={editingBlock}
          setEditingBlock={setEditingBlock}
          onSubmit={handleSaveBlockEdit}
          isInvalid={isEditBlockInvalid()}
        />

        <DeleteBlockDateModal
          open={isDeleteBlockOpen}
          onOpenChange={setIsDeleteBlockOpen}
          isSubmitting={isSubmitting}
          onConfirm={handleRemoveBlock}
        />

        <CardContent className="pt-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F07712]"></div>
            </div>
          ) : blockedDates.length > 0 ? (
            <div className="space-y-3">
              {blockedDates.map((block) => (
                <div key={block.id} className="flex flex-col gap-4 p-4 border rounded-xl bg-white hover:border-[#F07712]/40 hover:shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      
                      <p className="font-semibold text-slate-900">{new Date(block.blocked_date).toLocaleDateString()}</p>
                        {block.type === 'partial' && (
                        <p className="text-sm text-slate-500">
                          {formatTimeTo12Hour(block.start_time)} - {formatTimeTo12Hour(block.end_time)}
                        </p>
                      )}
                      <p className="text-sm text-slate-500">{block.reason}</p>
                    
                    </div>
                   
                  </div>
                  <div className="flex flex-col items-end gap-2">
                   <div className="flex justify-end">
                      <Badge 
                      className={block.type === 'full_day' 
                        ? 'bg-red-100 text-red-700 hover:bg-red-100' 
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-100'
                      }
                    >
                      {block.type === 'full_day' ? 'Full Day' : 'Partial'}
                    </Badge>
                   </div>
                   <div className="flex gap-1">
                     <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBlock(block)}
                      className="border-[#F07712] text-[#F07712] hover:bg-[#F07712] hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteBlockDialog(block.id)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                   </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No blocked dates</p>
              <p className="text-sm text-muted-foreground">You're available for orders on all days</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityManager;
