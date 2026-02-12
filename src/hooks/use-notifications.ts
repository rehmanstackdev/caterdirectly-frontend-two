import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'message' | 'system' | 'alert' | 'order' | 'event' | 'payment';

export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string; // Derived from created_at for display
  read: boolean;
  type: NotificationType;
  link?: string;
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Helper to map DB row to UI Notification type
  const mapDbToUi = (row: any): Notification => ({
    id: row.id,
    title: row.title,
    message: row.message,
    timestamp: formatTimestamp(new Date(row.created_at)),
    read: !!row.read,
    type: row.type as NotificationType,
    link: row.link ?? undefined,
  });

  // Fetch notifications when user is available
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (!user?.id) {
        if (isMounted) {
          setNotifications([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('id,title,message,created_at,read,type,link,recipient_user_id')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Notifications Error',
          description: error.message ?? 'Failed to load notifications',
          variant: 'destructive',
        });
        if (isMounted) {
          setNotifications([]);
        }
      } else {
        if (isMounted) {
          setNotifications((data ?? []).map(mapDbToUi));
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Realtime subscription - disabled for now since using custom backend
    // TODO: Implement realtime notifications via WebSocket or polling
    // if (user?.id) {
    //   const channel = supabase
    //     .channel(`realtime:notifications:${user.id}`)
    //     .on(...)
    //     .subscribe();
    //   return () => {
    //     supabase.removeChannel(channel);
    //     isMounted = false;
    //   };
    // }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Format timestamp to relative time (e.g., "2h ago", "Yesterday", "3 days ago")
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 2) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Update Failed',
        description: error.message ?? 'Could not mark notification as read.',
        variant: 'destructive',
      });
      // Revert optimistic change on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Update Failed',
        description: error.message ?? 'Could not mark all as read.',
        variant: 'destructive',
      });
      // Best-effort refetch to restore accurate state
      const { data } = await supabase
        .from('notifications')
        .select('id,title,message,created_at,read,type,link,recipient_user_id')
        .eq('recipient_user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications((data ?? []).map(mapDbToUi));
    }
  };

  // Keeps signature compatible with existing callers; timestamp is ignored (DB sets created_at)
  const addNotification = async (notification: Omit<Notification, 'id' | 'read'>) => {
    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to add notifications.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      recipient_user_id: user.id,
      title: notification.title,
      message: notification.message,
      type: notification.type, // FIX: keep literal union type, don't widen to string
      link: notification.link ?? null,
      read: false,
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(payload)
      .select('id,title,message,created_at,read,type,link')
      .single();

    if (error) {
      console.error('Error adding notification:', error);
      toast({
        title: 'Creation Failed',
        description: error.message ?? 'Could not create notification.',
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      // Realtime will also push this, but append immediately for snappy UX
      setNotifications((prev) => [mapDbToUi(data), ...prev]);
    }
  };

  const clearNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    const { error } = await supabase.from('notifications').delete().eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Delete Failed',
        description: error.message ?? 'Could not delete notification.',
        variant: 'destructive',
      });
      // Best-effort refetch to restore accurate state
      if (user?.id) {
        const { data } = await supabase
          .from('notifications')
          .select('id,title,message,created_at,read,type,link,recipient_user_id')
          .eq('recipient_user_id', user.id)
          .order('created_at', { ascending: false });
        setNotifications((data ?? []).map(mapDbToUi));
      }
    }
  };

  return {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearNotification,
    isLoading,
  };
};
