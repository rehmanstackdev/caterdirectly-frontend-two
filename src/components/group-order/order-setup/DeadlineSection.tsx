import React from "react";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { useGroupOrder } from "@/contexts/GroupOrderContext";

const DeadlineSection = () => {
  const { state, setOrderInfo } = useGroupOrder();
  
  // Use separate order deadline date and time (independent from event date/service time)
  const orderDeadlineDateStr = state.orderInfo?.orderDeadlineDate || '';
  const orderDeadlineTime = state.orderInfo?.orderDeadlineTime || '';

  // Convert date string to Date object for DatePicker
  const orderDeadlineDate = orderDeadlineDateStr 
    ? new Date(orderDeadlineDateStr + 'T00:00:00')
    : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    const currentOrderInfo = state.orderInfo || {
      orderName: '',
      location: '',
      date: '',
      deliveryWindow: '',
      headcount: 1,
      primaryContactName: '',
      primaryContactPhone: '',
      primaryContactEmail: '',
      hasBackupContact: false,
      backupContactName: '',
      backupContactPhone: '',
      backupContactEmail: '',
      additionalNotes: '',
      clientCompany: ''
    };

    if (selectedDate) {
      // Get local date components to avoid timezone conversion
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      setOrderInfo({
        ...currentOrderInfo,
        orderDeadlineDate: dateValue
      });
    } else {
      setOrderInfo({
        ...currentOrderInfo,
        orderDeadlineDate: ''
      });
    }
  };

  const handleTimeSelect = (selectedTime: string | undefined) => {
    const currentOrderInfo = state.orderInfo || {
      orderName: '',
      location: '',
      date: '',
      deliveryWindow: '',
      headcount: 1,
      primaryContactName: '',
      primaryContactPhone: '',
      primaryContactEmail: '',
      hasBackupContact: false,
      backupContactName: '',
      backupContactPhone: '',
      backupContactEmail: '',
      additionalNotes: '',
      clientCompany: ''
    };
    
    setOrderInfo({
      ...currentOrderInfo,
      orderDeadlineTime: selectedTime || ''
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-900">Order Deadline</Label>
      <p className="text-xs text-gray-500 mb-2">Set the deadline for guests to place their orders</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mt-1">
            <DatePicker
              date={orderDeadlineDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </div>
        </div>
        <div>
          <div className="mt-1">
            <TimePicker
              time={orderDeadlineTime}
              onSelect={handleTimeSelect}
              placeholder="Select time"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineSection;
