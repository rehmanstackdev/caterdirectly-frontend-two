
import { useState, useCallback } from 'react';
import type { Chat, ChatMessage } from '@/types/chat';

export const useChatMessages = () => {
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = useCallback((chats: Chat[], selectedChatId: string) => {
    if (!newMessage.trim()) return chats;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return chats.map(chat => {
      if (chat.id === selectedChatId) {
        const newMsg: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'user1',
          senderName: 'Me',
          senderImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
          content: newMessage,
          timestamp
        };

        return {
          ...chat,
          lastMessage: newMessage,
          timestamp: 'Just now',
          messages: [...chat.messages, newMsg]
        };
      }
      return chat;
    });
  }, [newMessage]);

  return {
    newMessage,
    setNewMessage,
    sendMessage,
  };
};
