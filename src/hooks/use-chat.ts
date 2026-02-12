
import { useChatMessages } from './use-chat-messages';
import { useChatSelection } from './use-chat-selection';
import { useToast } from './use-toast';
import { useCallback } from 'react';
import type { Chat, ChatMessage } from '@/types/chat';

// Initial chats data moved to a separate file to allow code-splitting
import { initialChats } from '@/data/initial-chats';

export const useChat = () => {
  const { toast } = useToast();
  const { chats, setChats, selectedChat, selectedChatId, setSelectedChatId } = useChatSelection(initialChats);
  const { newMessage, setNewMessage, sendMessage: sendChatMessage } = useChatMessages();

  const handleSendMessage = useCallback(() => {
    const updatedChats = sendChatMessage(chats, selectedChatId);
    setChats(updatedChats);
    setNewMessage('');

    // Simulate support team response
    if (selectedChat?.isSupport) {
      setTimeout(() => {
        const responseMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          senderId: 'support1',
          senderName: 'Support Team',
          senderImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
          content: 'Thank you for your message. How can we assist you today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSupport: true
        };

        setChats(prevChats => prevChats.map(c => {
          if (c.id === selectedChatId) {
            return {
              ...c,
              messages: [...c.messages, responseMsg],
              lastMessage: responseMsg.content,
              timestamp: 'Just now'
            };
          }
          return c;
        }));

        toast({
          title: "New message from Support Team",
          description: responseMsg.content,
          duration: 3000,
        });
      }, 1000);
    }
  }, [chats, selectedChatId, selectedChat?.isSupport, sendChatMessage, setNewMessage, toast]);

  return {
    chats,
    selectedChat,
    selectedChatId,
    setSelectedChatId,
    newMessage,
    setNewMessage,
    sendMessage: handleSendMessage
  };
};

export type { Chat, ChatMessage } from '@/types/chat';
