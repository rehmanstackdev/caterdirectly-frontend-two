import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import chatService, { type ChatRoom, type ChatMessage } from '@/services/api/chat.service';
import socketService from '@/services/socket.service';

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
  participants?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string | null;
  }>;
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

export const useAdminChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<AdminChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef(0);
  const cacheTimeout = 10000; // 10 seconds cache

  const fetchChatRooms = useCallback(async (force = false) => {
    if (!user || fetchingRef.current) return;
    
    // Reduce cache timeout for more frequent updates
    const reducedCacheTimeout = 2000; // 2 seconds instead of 10
    const now = Date.now();
    if (!force && now - lastFetchTime.current < reducedCacheTimeout) {
      console.log('⚡ Using cached data, skipping API call');
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = now;
      
      console.log(`🚀 Fetching chat data at ${new Date().toLocaleTimeString()}`);
      
      // Get all users and their chat rooms
      const [roomsResponse, usersResponse] = await Promise.all([
        chatService.getUserRooms(),
        chatService.getAllUsers()
      ]);
      
      console.log(`📊 API Response received at ${new Date().toLocaleTimeString()}`);
      
      console.log('Raw API responses:', {
        roomsResponse: roomsResponse,
        usersResponse: usersResponse
      });
      
      if (roomsResponse && roomsResponse.data) {
        const rooms: ChatRoom[] = roomsResponse.data;
        // Ensure allUsers is always an array
        const allUsers = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
        
        console.log('Chat API responses:', {
          roomsCount: rooms.length,
          usersCount: allUsers.length,
          currentUserId: user.id,
          rooms: rooms.map(r => ({ 
            id: r.id, 
            name: r.name, 
            participants: r.participants.map(p => ({
              id: p.id,
              firstName: p.firstName,
              lastName: p.lastName
            }))
          })),
          users: allUsers.slice(0, 3).map((u: any) => ({ 
            id: u.id, 
            firstName: u.firstName || u.first_name,
            lastName: u.lastName || u.last_name,
            email: u.email,
            allFields: Object.keys(u)
          }))
        });
        
        console.log(`🔄 Processing ${rooms.length} chat rooms...`);
        
        // Transform chat rooms to admin thread format
        const adminThreads: AdminChatThread[] = await Promise.all(
          rooms.map(async (room) => {
            // Get messages for each room
            const messagesResponse = await chatService.getRoomMessages(room.id);
            const messages: ChatMessage[] = messagesResponse?.data || [];
            
            // Extract participant name from room name since API doesn't return complete participant data
            let participantName = 'Unknown User';
            let participantEmail = '';
            
            // Try to get participant info from room participants first
            const otherParticipant = room.participants?.find(p => p.id !== user.id);
            let participantImageUrl = null;
            if (otherParticipant) {
              participantName = `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim();
              participantEmail = otherParticipant.email || '';
              participantImageUrl = otherParticipant.imageUrl;
            }
            
            // Fallback: extract from room name and find in users list
            if (participantName === 'Unknown User' && room.name && room.name.includes(' - ')) {
              const nameParts = room.name.split(' - ');
              if (nameParts.length === 2) {
                const otherUserFirstName = nameParts[1];
                
                // Find full user data by matching first name
                const foundUser = allUsers.find((u: any) => 
                  (u.firstName || '').toLowerCase() === otherUserFirstName.toLowerCase()
                );
                
                if (foundUser) {
                  participantName = `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim();
                  participantEmail = foundUser.email || '';
                } else {
                  participantName = otherUserFirstName;
                }
              }
            }
            
            console.log('Chat room participant lookup:', {
              roomId: room.id,
              roomName: room.name,
              participantName,
              participantEmail,
              otherParticipantId: otherParticipant?.id
            });
            
            // Count unread messages
            const unreadCount = messages.filter(m => !m.isRead && m.sender.id !== user.id).length;
            
            // Get last message
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
            
            return {
              id: room.id,
              participant_name: participantName,
              participant_email: participantEmail,
              participant_type: determineParticipantType(room.type),
              participant_image_url: participantImageUrl,
              last_message: lastMessage?.content || 'No messages yet',
              last_message_time: lastMessage?.createdAt || room.createdAt,
              unread_count: unreadCount,
              participants: room.participants?.filter(p => p.id !== user.id),
              messages: messages.map(msg => {
                // Ensure sender name is properly resolved
                const senderName = `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || 'Unknown User';
                
                return {
                  id: msg.id,
                  sender_id: msg.sender.id,
                  sender_name: senderName,
                  content: msg.content,
                  created_at: msg.createdAt,
                  read: msg.isRead,
                  message_type: 'general' as const
                };
              })
            };
          })
        );
        
        setThreads(adminThreads);
        console.log(`✅ Loaded ${adminThreads.length} chat threads at ${new Date().toLocaleTimeString()}`);
        console.log(`📈 Total API calls made: ${2 + rooms.length} (2 initial + ${rooms.length} message fetches)`);
      }
    } catch (error) {
      console.error(`❌ Error fetching chat rooms at ${new Date().toLocaleTimeString()}:`, error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [user, toast]);

  const sendMessage = async (threadId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      // Always use REST API for sending messages
      const response = await chatService.sendMessage(threadId, content);
      
      if (response && response.data) {
        // Add message to local state immediately
        const newMessage: AdminChatMessage = {
          id: response.data.id,
          sender_id: user.id,
          sender_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          content,
          created_at: response.data.createdAt,
          read: true,
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

  useEffect(() => {
    if (user?.id) {
      fetchChatRooms();
    }
  }, [user?.id, fetchChatRooms]);

  useEffect(() => {
    if (!user?.id) return;

    console.log('🔌 Connecting to Socket.IO for admin user:', user.id);
    
    // Try Socket.IO connection
    try {
      const socket = socketService.connect(user.id);
      
      if (socket) {
        // Listen for new messages
        socketService.onNewMessage((message) => {
          console.log('📨 Admin received new message via Socket.IO:', message);
          
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
    refreshThreads: () => fetchChatRooms(true), // Force refresh
    isSocketConnected: socketService.isSocketConnected()
  };
};

// Helper function to determine participant type from room type
function determineParticipantType(roomType: string): 'client' | 'support' | 'vendor' | 'host' {
  if (roomType.includes('host')) return 'host';
  if (roomType.includes('vendor')) return 'vendor';
  if (roomType.includes('support')) return 'support';
  return 'client';
}