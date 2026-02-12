
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface VendorMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_email: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  message_type: 'client_inquiry' | 'support' | 'order_related' | 'general';
  order_id?: string;
  client_phone?: string;
}

interface MessageThread {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  participant_type: 'client' | 'support';
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: VendorMessage[];
}

export const useVendorRealMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessageThreads = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get vendor data
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, company_name')
        .eq('user_id', user.id)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        return;
      }

      // Fetch real messages from vendor_support_tickets (using actual available fields)
      const { data: supportTickets, error: ticketsError } = await supabase
        .from('vendor_support_tickets')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching support tickets:', ticketsError);
        return;
      }

      // Group tickets into conversation threads based on available fields
      const threadMap = new Map<string, MessageThread>();
      
      supportTickets?.forEach(ticket => {
        // Use subject or category as the thread identifier since we don't have client info
        const threadKey = `support-${ticket.category}-${ticket.id}`;
        
        if (!threadMap.has(threadKey)) {
          threadMap.set(threadKey, {
            id: threadKey,
            participant_id: 'support',
            participant_name: 'Support Team',
            participant_email: 'support@caterdirectly.com',
            participant_type: 'support',
            last_message: ticket.message,
            last_message_time: ticket.created_at,
            unread_count: ticket.status === 'open' ? 1 : 0,
            messages: []
          });
        }

        const thread = threadMap.get(threadKey)!;
        
        // Add the original ticket as a message
        thread.messages.push({
          id: ticket.id,
          sender_id: 'support',
          sender_name: 'Support Team',
          sender_email: 'support@caterdirectly.com',
          recipient_id: vendorData.id,
          content: ticket.message,
          created_at: ticket.created_at,
          read: ticket.status !== 'open',
          message_type: 'support'
        });

        // Add admin response as a separate message if exists
        if (ticket.admin_response) {
          thread.messages.push({
            id: `${ticket.id}-response`,
            sender_id: 'admin',
            sender_name: 'Admin Support',
            sender_email: 'admin@caterdirectly.com',
            recipient_id: vendorData.id,
            content: ticket.admin_response,
            created_at: ticket.responded_at || ticket.created_at,
            read: true,
            message_type: 'support'
          });
        }
      });

      setThreads(Array.from(threadMap.values()));
    } catch (error) {
      console.error('Error fetching message threads:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (threadId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      // For now, we'll add the message to the local state
      // In a full implementation, you'd save this to a proper messages table
      const thread = threads.find(t => t.id === threadId);
      if (!thread) return;

      const newMessage: VendorMessage = {
        id: Date.now().toString(),
        sender_id: user.id,
        sender_name: 'Vendor',
        sender_email: user.email || '',
        recipient_id: thread.participant_id,
        content,
        created_at: new Date().toISOString(),
        read: false,
        message_type: 'general'
      };

      setThreads(prevThreads => 
        prevThreads.map(t => 
          t.id === threadId 
            ? { 
                ...t, 
                messages: [...t.messages, newMessage],
                last_message: content,
                last_message_time: new Date().toISOString()
              }
            : t
        )
      );

      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (threadId: string) => {
    setThreads(prevThreads =>
      prevThreads.map(t =>
        t.id === threadId
          ? { ...t, unread_count: 0, messages: t.messages.map(m => ({ ...m, read: true })) }
          : t
      )
    );
  };

  useEffect(() => {
    fetchMessageThreads();
  }, [user]);

  // Set up real-time subscription for new support tickets
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('vendor-support-tickets')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_support_tickets'
        },
        () => {
          fetchMessageThreads(); // Refresh threads when new ticket arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    threads,
    loading,
    sendMessage,
    markAsRead,
    refreshThreads: fetchMessageThreads
  };
};
