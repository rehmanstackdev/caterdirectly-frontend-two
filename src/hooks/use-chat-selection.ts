
import { useState, useCallback } from 'react';
import type { Chat } from '@/types/chat';

export const useChatSelection = (initialChats: Chat[]) => {
  const [selectedChatId, setSelectedChatId] = useState<string>(initialChats[0]?.id || '');
  const [chats, setChats] = useState<Chat[]>(initialChats);

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  
  // Optimize the setSelectedChatId function with useCallback
  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  return {
    chats,
    setChats,
    selectedChat,
    selectedChatId,
    setSelectedChatId: handleSelectChat,
  };
};
