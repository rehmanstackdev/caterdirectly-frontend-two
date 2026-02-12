import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'vendor' | 'client' | 'support' | 'admin';
  recipientId: string;
  recipientName: string;
  subject?: string;
  content: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  messageType: 'client' | 'support' | 'order' | 'proposal';
  orderId?: string;
  proposalId?: string;
}

interface MessageThread {
  id: string;
  participantId: string;
  participantName: string;
  participantType: 'client' | 'support' | 'admin';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messageType: 'client' | 'support' | 'order' | 'proposal';
  orderId?: string;
  proposalId?: string;
  status: 'active' | 'resolved' | 'pending';
}

export const useVendorMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
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

      // For now, we'll create mock threads since the messaging system needs to be built
      // In a real implementation, you'd query actual message threads from the database
      const mockThreads: MessageThread[] = [
        {
          id: 'support-thread',
          participantId: 'support',
          participantName: 'Cater Directly Support',
          participantType: 'support',
          lastMessage: 'How can we help you today?',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          messageType: 'support',
          status: 'active'
        }
      ];
      
      setThreads(mockThreads);
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

  const fetchMessages = async (threadId: string) => {
    try {
      // Mock messages - in real implementation would fetch from database
      const mockMessages: Message[] = [
        {
          id: 'welcome-msg',
          senderId: 'support',
          senderName: 'Cater Directly Support',
          senderType: 'support',
          recipientId: user!.id,
          recipientName: 'Vendor',
          content: 'Welcome to the messaging system! How can we help you today?',
          timestamp: new Date().toISOString(),
          read: true,
          priority: 'medium',
          messageType: 'support'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (threadId: string, content: string, selectedThread: MessageThread) => {
    if (!user || !content.trim()) return;

    try {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: 'Vendor',
        senderType: 'vendor',
        recipientId: selectedThread.participantId,
        recipientName: selectedThread.participantName,
        content,
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'medium',
        messageType: selectedThread.messageType,
        orderId: selectedThread.orderId,
        proposalId: selectedThread.proposalId
      };

      setMessages(prev => [...prev, message]);
      
      // Update thread with latest message
      setThreads(threads.map(thread => 
        thread.id === threadId 
          ? { ...thread, lastMessage: content, lastMessageTime: new Date().toISOString() }
          : thread
      ));

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

  const startSupportConversation = () => {
    const supportThread: MessageThread = {
      id: 'support-' + Date.now(),
      participantId: 'support',
      participantName: 'Cater Directly Support',
      participantType: 'support',
      lastMessage: 'How can we help you today?',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      messageType: 'support',
      status: 'active'
    };
    
    setThreads([supportThread, ...threads]);
    return supportThread;
  };

  useEffect(() => {
    fetchThreads();
  }, [user]);

  return {
    threads,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    startSupportConversation,
    refreshThreads: fetchThreads
  };
};