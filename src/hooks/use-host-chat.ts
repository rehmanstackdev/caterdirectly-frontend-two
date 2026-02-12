import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import chatService, { type ChatRoom, type ChatMessage } from '@/services/api/chat.service';
import socketService from '@/services/socket.service';
import hostService from '@/services/api/host/host.Service';
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

export const useHostChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<AdminChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  const fetchChatRooms = async (force = false) => {
    if (!user) return;

    try {
      console.log('🚀 Fetching chat rooms (force:', force, ')');
      
      const [roomsResponse, vendorsResponse] = await Promise.all([
        chatService.getUserRooms(),
        hostService.getHostVendors()
      ]);
      
      if (roomsResponse && roomsResponse.data) {
        const rooms: ChatRoom[] = roomsResponse.data;
        const vendors = vendorsResponse?.data || [];
        
        const hostThreads: AdminChatThread[] = await Promise.all(
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
            
            // If no participant data, try to match with vendors from invoice API
            if (participantName === 'Unknown User' && otherParticipant) {
              const vendor = vendors.find((v: any) => v.id === otherParticipant.id);
              if (vendor) {
                participantName = `${vendor.firstName || ''} ${vendor.lastName || ''}`.trim();
                participantEmail = vendor.email || '';
                participantType = 'vendor';
              }
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
        
        console.log('📋 Loaded host threads:', hostThreads.map(t => ({ id: t.id, name: t.participant_name })));
        setThreads(hostThreads);
        if (!selectedThreadId && hostThreads.length > 0) {
          setSelectedThreadId(hostThreads[0].id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching chat rooms:', error);
      
      if (error?.response?.status === 403) {
        console.log('Host user does not have permission to access chat rooms');
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
    }
  };

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

  const startChatWithVendor = async (vendorId: string, name?: string) => {
    try {
      console.log('🚀 Starting chat with vendor:', { 
        vendorId, 
        name, 
        currentUser: user?.id,
        userRole: user?.role,
        userType: user?.userType 
      });
      
      // Check auth headers and JWT token
      const authHeaders = getAuthHeader();
      console.log('🔑 Auth headers:', authHeaders);
      
      // Parse JWT token to check role
      const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🎫 JWT payload:', payload);
          console.log('👤 User role from token:', payload.role || payload.userType);
        } catch (e) {
          console.error('❌ Failed to parse JWT:', e);
        }
      }
      
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('🌐 API URL:', apiUrl);
      console.log('🎯 Target vendor ID:', vendorId);
      
      const response = await chatService.startChat(vendorId);
      console.log('✅ Chat service response:', response);
      
      if (response && response.data) {
        console.log('🔄 Refreshing chat rooms...');
        await fetchChatRooms(true); // Force refresh, bypass cache
        
        console.log('🎯 Setting selected thread:', response.data.id);
        console.log('📋 Current threads after refresh:', threads.map(t => ({ id: t.id, name: t.participant_name })));
        setSelectedThreadId(response.data.id);
        
        toast({
          title: "Chat started",
          description: `Chat with ${name || 'vendor'} has been created`,
        });
      } else {
        console.error('❌ No response data from chat service');
        toast({
          title: "Error",
          description: "Failed to create chat room - no response data",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Error starting vendor chat:', {
        error,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      
      let errorMessage = "Failed to start vendor chat";
      
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      } else if (error?.response?.status === 403) {
        console.log('🚫 403 Forbidden - checking user permissions:', {
          userRole: user?.role,
          userType: user?.userType,
          authToken: !!localStorage.getItem('auth_token'),
          accessToken: !!localStorage.getItem('access_token')
        });
        errorMessage = "Permission denied. Host users may not have chat permissions with this vendor.";
      } else if (error?.response?.status === 404) {
        errorMessage = "The selected vendor could not be found in the system.";
      } else if (error?.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startChatWithAdmin = async () => {
    try {
      // Use known admin ID (Super Admin from your API response)
      const adminId = 'b5ea2327-331a-47ed-9e54-d823d7dd9c5e';
      
      const response = await chatService.startChat(adminId);
      
      if (response && response.data) {
        await fetchChatRooms();
        setSelectedThreadId(response.data.id);
        
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
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    let pollInterval: NodeJS.Timeout;
    let visibilityListener: () => void;

    // Try Socket.IO connection
    try {
      socketService.connect(user.id);
      socketService.onNewMessage((message) => {
        console.log('Host received socket message:', message);
        setThreads(prevThreads => 
          prevThreads.map(t => 
            t.id === message.room?.id 
              ? { 
                  ...t, 
                  messages: [...t.messages, {
                    id: message.id,
                    sender_id: message.sender?.id || '',
                    sender_name: `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.trim() || 'Unknown',
                    content: message.content || 'No content',
                    created_at: message.createdAt || new Date().toISOString(),
                    read: false,
                    message_type: 'general'
                  }],
                  last_message: message.content || 'No content',
                  last_message_time: message.createdAt || new Date().toISOString(),
                  unread_count: message.sender?.id !== user.id ? t.unread_count + 1 : t.unread_count
                }
              : t
          )
        );
      });
    } catch (error) {
      console.log('Socket connection failed:', error);
    }

    // More frequent polling for real-time updates
    pollInterval = setInterval(() => {
      fetchChatRooms(true); // Force refresh every 5 seconds
    }, 5000);

    // Refresh when window becomes visible
    visibilityListener = () => {
      if (!document.hidden) {
        fetchChatRooms(true);
      }
    };
    document.addEventListener('visibilitychange', visibilityListener);

    // Refresh when window gains focus
    const focusListener = () => fetchChatRooms(true);
    window.addEventListener('focus', focusListener);
      
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', visibilityListener);
      window.removeEventListener('focus', focusListener);
      
      try {
        socketService.offNewMessage();
        socketService.disconnect();
      } catch (error) {
        console.log('Socket cleanup error:', error);
      }
    };
  }, [user?.id]);

  return {
    threads,
    selectedThread,
    selectedThreadId,
    setSelectedThreadId,
    loading,
    sendMessage,
    markAsRead,
    markMessageAsRead,
    startChatWithAdmin,
    startChatWithVendor,
    refreshThreads: fetchChatRooms
  };
};