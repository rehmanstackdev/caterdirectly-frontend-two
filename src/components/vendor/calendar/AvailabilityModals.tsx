import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AvailabilityRule = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  max_orders_per_day?: number;
};

type BlockData = {
  date: Date | undefined;
  reason: string;
  type: 'full_day' | 'partial';
  startTime?: string;
  endTime?: string;
};

type EditBlockData = {
  id: string;
  date: Date;
  reason: string;
  type: 'full_day' | 'partial';
  startTime?: string;
  endTime?: string;
};

interface AddAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  newRule: AvailabilityRule;
  setNewRule: (rule: AvailabilityRule) => void;
  dayNames: string[];
  availableDays: number[];
  onSubmit: () => void;
}

export const AddAvailabilityModal: React.FC<AddAvailabilityModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  newRule,
  setNewRule,
  dayNames,
  availableDays,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add Day Availability</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Day</Label>
            <Select
              value={newRule.day_of_week.toString()}
              onValueChange={(value) =>
                setNewRule({ ...newRule, day_of_week: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {availableDays.length > 0 ? (
                  availableDays.map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {dayNames[day]}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="-1" disabled>
                    All days added
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={newRule.is_available ? 'available' : 'closed'}
              onValueChange={(value) =>
                setNewRule({ ...newRule, is_available: value === 'available' })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {newRule.is_available && (
            <>
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={newRule.start_time}
                  onChange={(e) =>
                    setNewRule({ ...newRule, start_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={newRule.end_time}
                  onChange={(e) =>
                    setNewRule({ ...newRule, end_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Accept Orders Per Day</Label>
                <Input
                  type="number"
                  min={0}
                  value={newRule.max_orders_per_day ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewRule({
                      ...newRule,
                      max_orders_per_day: value === '' ? undefined : Number(value),
                    });
                  }}
                />
              </div>
            </>
          )}
          <div className="flex gap-2 pt-4">
            <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding...
                </span>
              ) : (
                'Add Day'
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  editingRule: AvailabilityRule | null;
  setEditingRule: (rule: AvailabilityRule | null) => void;
  dayNames: string[];
  onSubmit: () => void;
}

export const EditAvailabilityModal: React.FC<EditAvailabilityModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  editingRule,
  setEditingRule,
  dayNames,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Weekly Availability</DialogTitle>
        </DialogHeader>
        {editingRule && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Day</Label>
              <Input value={dayNames[editingRule.day_of_week]} disabled />
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={editingRule.is_available ? 'available' : 'closed'}
                onValueChange={(value) =>
                  setEditingRule({
                    ...editingRule,
                    is_available: value === 'available',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingRule.is_available && (
              <>
                <div className="space-y-1">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={editingRule.start_time}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        start_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editingRule.end_time}
                    onChange={(e) =>
                      setEditingRule({
                        ...editingRule,
                        end_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Accept Orders Per Day</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingRule.max_orders_per_day ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditingRule({
                        ...editingRule,
                        max_orders_per_day:
                          value === '' ? undefined : Number(value),
                      });
                    }}
                  />
                </div>
              </>
            )}
            <div className="flex gap-2 pt-4">
              <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface DeleteAvailabilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export const DeleteAvailabilityModal: React.FC<DeleteAvailabilityModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Delete Availability</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this availability rule? This action
            cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface BlockDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  blockData: BlockData;
  setBlockData: (data: BlockData) => void;
  onSubmit: () => void;
  isInvalid: boolean;
}

export const BlockDateModal: React.FC<BlockDateModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  blockData,
  setBlockData,
  onSubmit,
  isInvalid,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Block Date</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Date</Label>
            <DatePicker
              date={blockData.date}
              onSelect={(date) => setBlockData({ ...blockData, date })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="blockReason">Reason</Label>
            <Input
              id="blockReason"
              value={blockData.reason}
              onChange={(e) =>
                setBlockData({ ...blockData, reason: e.target.value })
              }
              placeholder="e.g., Vacation, Fully Booked, Equipment Maintenance"
            />
          </div>
          <div className="space-y-1">
            <Label>Block Type</Label>
            <Select
              value={blockData.type}
              onValueChange={(value: 'full_day' | 'partial') =>
                setBlockData({ ...blockData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">Full Day</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {blockData.type === 'partial' && (
            <>
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={blockData.startTime}
                  onChange={(e) =>
                    setBlockData({ ...blockData, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={blockData.endTime}
                  onChange={(e) =>
                    setBlockData({ ...blockData, endTime: e.target.value })
                  }
                />
              </div>
            </>
          )}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onSubmit}
              className="flex-1"
              disabled={isSubmitting || isInvalid}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Blocking...
                </span>
              ) : (
                'Block Date'
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditBlockDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  editingBlock: EditBlockData | null;
  setEditingBlock: (data: EditBlockData | null) => void;
  onSubmit: () => void;
  isInvalid: boolean;
}

export const EditBlockDateModal: React.FC<EditBlockDateModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  editingBlock,
  setEditingBlock,
  onSubmit,
  isInvalid,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Block Date</DialogTitle>
        </DialogHeader>
        {editingBlock && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Date</Label>
              <DatePicker
                date={editingBlock.date}
                onSelect={(date) =>
                  setEditingBlock({ ...editingBlock, date: date as Date })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Reason</Label>
              <Input
                value={editingBlock.reason}
                onChange={(e) =>
                  setEditingBlock({ ...editingBlock, reason: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Block Type</Label>
              <Select
                value={editingBlock.type}
                onValueChange={(value: 'full_day' | 'partial') =>
                  setEditingBlock({ ...editingBlock, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_day">Full Day</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingBlock.type === 'partial' && (
              <>
                <div className="space-y-1">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={editingBlock.startTime}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editingBlock.endTime}
                    onChange={(e) =>
                      setEditingBlock({
                        ...editingBlock,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={onSubmit}
                className="flex-1"
                disabled={isSubmitting || isInvalid}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface DeleteBlockDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export const DeleteBlockDateModal: React.FC<DeleteBlockDateModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Delete Block Date</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this blocked date? This action cannot
            be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={onConfirm}
              variant="destructive"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
