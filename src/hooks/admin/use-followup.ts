import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScheduleFollowupParams {
  leadId: string;
  title: string;
  description?: string;
  contactMethod: string;
  scheduledAt: string;
}

export function useScheduleFollowup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: ScheduleFollowupParams) => {
      const user = await supabase.auth.getUser();
      
      // Create the follow-up activity
      const { data: activity, error: activityError } = await supabase
        .from('lead_activities')
        .insert([{
          lead_id: params.leadId,
          activity_type: 'follow_up_reminder',
          title: params.title,
          description: params.description,
          contact_method: params.contactMethod,
          scheduled_at: params.scheduledAt,
          admin_user_id: user.data.user?.id
        }])
        .select()
        .single();

      if (activityError) throw activityError;

      // Create notification for the scheduled follow-up
      const scheduledDate = new Date(params.scheduledAt);
      const reminderDate = new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          recipient_user_id: user.data.user?.id,
          title: 'Follow-up Reminder',
          message: `Scheduled follow-up: ${params.title}`,
          type: 'system',
          link: `/admin/leads?lead=${params.leadId}`,
          source_type: 'lead_activity',
          source_id: activity.id,
          meta: {
            lead_id: params.leadId,
            activity_id: activity.id,
            contact_method: params.contactMethod,
            scheduled_at: params.scheduledAt,
            reminder_date: reminderDate.toISOString()
          }
        });

      if (notificationError) {
        console.warn('Failed to create notification:', notificationError);
        // Don't throw here as the activity was created successfully
      }

      return activity;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead', data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Follow-up scheduled successfully');
    },
    onError: (error) => {
      console.error('Error scheduling follow-up:', error);
      toast.error('Failed to schedule follow-up');
    }
  });
}