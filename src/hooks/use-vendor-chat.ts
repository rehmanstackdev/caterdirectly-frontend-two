import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import chatService, { type ChatRoom, type ChatMessage } from '@/services/api/chat.service';
import socketService from '@/services/socket.service';
import { getAuthHeader } from '@/utils/utils';

interface AdminChatThread {
  id: string;
  participant_name: string;
  participant_email: string;
  participant_type: 'client' | 'support' | 'vendor' | 'host';
  participant_image_url?: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  messages: AdminChatMessage[];
}

interface AdminChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  read: boolean;
  message_type: 'client_inquiry' | 'support' | 'order_related' | 'general';
}

export const useVendorChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<AdminChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef(0);
  const cacheTimeout = 10000; // 10 seconds cache

  const fetchChatRooms = useCallback(async (force = false) => {
    if (!user || fetchingRef.current) return;
    
    // Check cache timeout
    const now = Date.now();
    if (!force && now - lastFetchTime.current < cacheTimeout) {
      console.log('⚡ Using cached data, skipping API call');
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = now;
      
      console.log(`🚀 Fetching chat data at ${new Date().toLocaleTimeString()}`);
      
      // Get all chat rooms for vendor
      const roomsResponse = await chatService.getUserRooms();
      
      console.log(`📊 API Response received at ${new Date().toLocaleTimeString()}`);
      
      if (roomsResponse && roomsResponse.data) {
        const rooms: ChatRoom[] = roomsResponse.data;
        
        console.log(`🔄 Processing ${rooms.length} chat rooms...`);
        
        // Transform chat rooms to admin thread format
        const vendorThreads: AdminChatThread[] = await Promise.all(
          rooms.map(async (room) => {
            // Fetch full messages with sender info from separate API
            const messagesResponse = await chatService.getRoomMessages(room.id);
            const messages = messagesResponse?.data || [];
            
            // Extract participant name from room name
            let participantName = 'Unknown User';
            let participantEmail = '';
            let participantType: 'client' | 'support' | 'vendor' | 'host' = 'support';
            
            // Get the other participant (not current user)
            const otherParticipant = room.participants?.find(p => p.id !== user.id);
            let participantImageUrl = null;
            if (otherParticipant) {
              participantName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim();
              participantEmail = otherParticipant.email || '';
              participantImageUrl = otherParticipant.imageUrl;
            }
            
            // Fallback: extract from room name if participant data not available
            if (participantName === 'Unknown User' && room.name && room.name.includes(' - ')) {
              const nameParts = room.name.split(' - ');
              if (nameParts.length === 2) {
                participantName = nameParts[0] === user.firstName ? nameParts[1] : nameParts[0];
              }
            }
            
            // Determine participant type from room type
            if (room.type.includes('admin')) {
              participantType = 'support';
            } else if (room.type.includes('vendor')) {
              participantType = 'vendor';
            } else if (room.type.includes('host')) {
              participantType = 'host';
            }
            
            const unreadCount = messages.filter(m => !m.isRead && m.sender?.id !== user.id).length;
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            
            return {
              id: room.id,
              participant_name: participantName,
              participant_email: participantEmail,
              participant_type: participantType,
              participant_image_url: participantImageUrl,
              last_message: lastMessage?.content || 'No messages yet',
              last_message_time: lastMessage?.createdAt || room.createdAt,
              unread_count: unreadCount,
              messages: messages.map((msg: any) => ({
                id: msg.id,
                sender_id: msg.sender?.id || 'unknown',
                sender_name: msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'Unknown',
                content: msg.content,
                created_at: msg.createdAt,
                read: msg.isRead !== false,
                message_type: 'general' as const
              }))
            };
          })
        );
        
        console.log(`✅ Loaded ${vendorThreads.length} chat threads at ${new Date().toLocaleTimeString()}`);
        console.log(`📈 Total API calls made: ${1 + rooms.length} (1 initial + ${rooms.length} message fetches)`);
        setThreads(vendorThreads);
      }
    } catch (error: any) {
      console.error(`❌ Error fetching chat rooms at ${new Date().toLocaleTimeString()}:`, error);
      
      if (error?.response?.status === 403) {
        console.log('Vendor user does not have permission to access chat rooms');
        setThreads([]);
      } else {
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, toast]);

  const sendMessage = async (threadId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      // Send message using /chat/room/{roomId}/message API
      const response = await chatService.sendMessage(threadId, content);
      
      if (response && response.data) {
        // Fetch latest messages after sending
        const messagesResponse = await chatService.getRoomMessages(threadId);
        const updatedMessages = messagesResponse?.data || [];
        
        // Update the thread with latest messages
        setThreads(prevThreads => 
          prevThreads.map(t => 
            t.id === threadId 
              ? { 
                  ...t, 
                  messages: updatedMessages.map((msg: any) => ({
                    id: msg.id,
                    sender_id: msg.sender?.id || 'unknown',
                    sender_name: msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'Unknown',
                    content: msg.content,
                    created_at: msg.createdAt,
                    read: msg.isRead !== false,
                    message_type: 'general' as const
                  })),
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
      }
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
    try {
      await chatService.markRoomMessagesAsRead(threadId);
      
      setThreads(prevThreads =>
        prevThreads.map(t =>
          t.id === threadId
            ? { ...t, unread_count: 0, messages: t.messages.map(m => ({ ...m, read: true })) }
            : t
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string, threadId: string) => {
    try {
      await chatService.markMessageAsRead(messageId);
      
      setThreads(prevThreads =>
        prevThreads.map(t =>
          t.id === threadId
            ? { 
                ...t, 
                messages: t.messages.map(m => 
                  m.id === messageId ? { ...m, read: true } : m
                ),
                unread_count: Math.max(0, t.unread_count - 1)
              }
            : t
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const startChatWithAdmin = async (adminId?: string) => {
    try {
      // Use provided admin ID or fallback to known admin ID
      const targetAdminId = adminId || 'b5ea2327-331a-47ed-9e54-d823d7dd9c5e';
      
      const response = await chatService.startChat(targetAdminId);
      
      if (response && response.data) {
        await fetchChatRooms(true);
        
        toast({
          title: "Chat started",
          description: "Support chat has been created",
        });
      }
    } catch (error) {
      console.error('Error starting admin chat:', error);
      toast({
        title: "Error",
        description: "Failed to start support chat",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchChatRooms();
    }
  }, [user?.id, fetchChatRooms]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('🔌 Connecting to Socket.IO for vendor user:', user.id);
    
    // Try Socket.IO connection
    try {
      const socket = socketService.connect(user.id);
      
      if (socket) {
        // Listen for new messages
        socketService.onNewMessage((message) => {
          console.log('📨 Vendor received new message via Socket.IO:', message);
          
          setThreads(prevThreads => 
            prevThreads.map(t => 
              t.id === message.roomId || t.id === message.room?.id
                ? { 
                    ...t, 
                    messages: [...(t.messages || []), {
                      id: message.id,
                      sender_id: message.sender?.id || message.senderId,
                      sender_name: `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || 'Unknown',
                      content: message.content,
                      created_at: message.createdAt || new Date().toISOString(),
                      read: false,
                      message_type: 'general'
                    }],
                    last_message: message.content,
                    last_message_time: message.createdAt || new Date().toISOString(),
                    unread_count: (message.sender?.id || message.senderId) !== user.id ? (t.unread_count || 0) + 1 : t.unread_count
                  }
                : t
            )
          );
        });
      }
    } catch (error) {
      console.log('❌ Socket connection failed:', error);
    }
      
    // Clear any existing polling interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // More frequent polling for real-time updates
    pollIntervalRef.current = setInterval(() => {
      fetchChatRooms(true); // Force refresh every 5 seconds
    }, 5000);

    // Refresh when window becomes visible
    const visibilityListener = () => {
      if (!document.hidden) {
        fetchChatRooms(true);
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);

    // Refresh when window gains focus
    const focusListener = () => fetchChatRooms(true);
    window.addEventListener('focus', focusListener);
      
    return () => {
      console.log('🔌 Disconnecting Socket.IO');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      document.removeEventListener('visibilitychange', visibilityListener);
      window.removeEventListener('focus', focusListener);
      socketService.offNewMessage();
      socketService.disconnect();
    };
  }, [user?.id, fetchChatRooms]);

  return {
    threads,
    loading,
    sendMessage,
    markAsRead,
    markMessageAsRead,
    startChatWithAdmin,
    refreshThreads: () => fetchChatRooms(true), // Force refresh
    isSocketConnected: socketService.isSocketConnected()
  };
};