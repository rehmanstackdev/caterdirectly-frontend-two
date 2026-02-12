
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const sendReminders = async (eventId: string, reminderType: '24h' | '1h' = '24h') => {
  try {
    console.log(`Sending ${reminderType} reminders for event ${eventId}`);
    
    // Call the send-event-reminders edge function
    const { data, error } = await supabase.functions.invoke('send-event-reminders', {
      body: {
        eventId,
        reminderType
      }
    });

    if (error) throw error;

    if (data?.success) {
      toast.success("Reminder emails sent successfully!", {
        description: `${data.guestsNotified} pending guests have been notified about the event.`
      });
      
      return {
        success: true,
        message: data.message,
        guestsNotified: data.guestsNotified
      };
    } else {
      throw new Error(data?.error || 'Failed to send reminders');
    }
  } catch (error: any) {
    console.error("Error sending reminders:", error);
    
    toast.error("Failed to send reminders", {
      description: error.message || "There was an issue sending reminder emails. Please try again."
    });
    
    return {
      success: false,
      message: error.message || "Failed to send reminders"
    };
  }
};
