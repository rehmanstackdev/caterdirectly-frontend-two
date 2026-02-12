
import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import type { Chat, ChatMessage } from '@/types/chat';
import { callRpc } from '@/utils/supabaseRpc';

// Utility: format time to "HH:MM" (or similar) as the DB stores timestamp as text
const formatTimeText = (d = new Date()) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const SUPPORT_NAME = 'Support Team';
const SUPPORT_IMAGE = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158';

export const useLiveChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId),
    [chats, selectedChatId]
  );

  // Fetch chat IDs the current user participates in
  const fetchUserChatIds = useCallback(async (): Promise<string[]> => {
    if (!user) return [];
    const { data, error } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching chat participants:', error);
      return [];
    }
    return (data || []).map((r: any) => r.chat_id);
  }, [user]);

  // Fetch chats by IDs
  const fetchChatsByIds = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setChats([]);
      return;
    }
    const { data, error } = await supabase
      .from('chats')
      .select('id, name, last_message, timestamp, is_support, updated_at')
      .in('id', ids)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching chats:', error);
      return;
    }

    // Map DB -> UI Chat type, messages will be loaded when chat is selected
    const mapped: Chat[] = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name || (c.is_support ? SUPPORT_NAME : 'Conversation'),
      image: c.is_support ? SUPPORT_IMAGE : '', // optional; no mock content, fall back to blank
      lastMessage: c.last_message || '',
      timestamp: c.timestamp || '',
      isSupport: !!c.is_support,
      messages: [],
    }));

    setChats(mapped);
    if (!selectedChatId && mapped.length) {
      setSelectedChatId(mapped[0].id);
    }
  }, [selectedChatId]);

  const refreshChats = useCallback(async () => {
    const ids = await fetchUserChatIds();
    await fetchChatsByIds(ids);
  }, [fetchUserChatIds, fetchChatsByIds]);

  // Fetch messages for a chat
  const fetchMessages = useCallback(async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, sender_name, sender_image, content, timestamp, is_support, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    const mapped: ChatMessage[] = (data || []).map((m: any) => ({
      id: m.id,
      senderId: m.sender_id || '',
      senderName: m.sender_name || 'User',
      senderImage: m.sender_image || '',
      content: m.content,
      timestamp: m.timestamp || '',
      isSupport: !!m.is_support,
    }));

    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages: mapped } : c))
    );
  }, []);

  // Send message to selected chat
  const sendMessage = useCallback(async () => {
    if (!user || !selectedChatId) return;
    const chat = chats.find((c) => c.id === selectedChatId);
    if (!chat) return;

    const content = (chat as any)._draftNewMessage || ''; // internal transient field used via setNewMessage
    const trimmed = content.trim();
    if (!trimmed) return;

    const tsText = formatTimeText();

    const { error } = await supabase.from('messages').insert({
      chat_id: selectedChatId,
      content: trimmed,
      timestamp: tsText,
      sender_id: user.id,
      sender_name: 'Me', // could be from profiles if available
      sender_image: '',
      is_support: false,
    });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return;
    }

    // Clear draft and let realtime or fetch update the UI
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChatId ? ({ ...c, lastMessage: trimmed, timestamp: tsText } as Chat) : c
      )
    );
    setNewMessage(''); // reset draft
    await fetchMessages(selectedChatId);
  }, [user, selectedChatId, chats, toast, fetchMessages]);

  // Simple "newMessage" state wired to selected chat via a transient property
  const [internalDraft, setInternalDraft] = useState('');
  const setNewMessage = useCallback((text: string) => {
    setInternalDraft(text);
    setChats((prev) =>
      prev.map((c) => (c.id === selectedChatId ? ({ ...c, _draftNewMessage: text } as any) : c))
    );
  }, [selectedChatId]);

  // Ensure/open support chat via RPC
  const openSupportChat = useCallback(async () => {
    console.log('[chat] openSupportChat clicked');
    const { data, error } = await callRpc<undefined, string>('ensure_support_chat');
    if (error) {
      console.error('Error ensuring support chat:', error);
      toast({
        title: 'Error',
        description: 'Unable to open support chat',
        variant: 'destructive',
      });
      return;
    }
    const chatId = data as string;
    console.log('[chat] support chat id', chatId);
    // Select immediately for snappier UX, then refresh & load messages
    setSelectedChatId(chatId);
    await refreshChats();
    await fetchMessages(chatId);
  }, [refreshChats, fetchMessages, toast, setSelectedChatId]);

  // Create/open vendor chat by vendor email via RPC
  const openVendorChatByEmail = useCallback(
    async (email: string, name?: string | null) => {
      const { data, error } = await callRpc<{ p_vendor_email: string; p_chat_name: string | null }, string>(
        'create_direct_chat_with_vendor',
        {
          p_vendor_email: (email || '').toLowerCase(),
          p_chat_name: name || null,
        }
      );

      if (error) {
        console.error('Error creating vendor chat:', error);
        toast({
          title: 'Unable to start conversation',
          description:
            'We could not start a chat with this vendor. Make sure you have an order with them.',
          variant: 'destructive',
        });
        return;
      }

      const chatId = data as string;
      setSelectedChatId(chatId);
      await refreshChats();
      await fetchMessages(chatId);
    },
    [refreshChats, fetchMessages, toast]
  );

  // Realtime subscriptions: chats and messages
  useEffect(() => {
    if (!user) return;

    // On new chats affecting the user, refresh list
    const chatsChannel = supabase
      .channel('chats-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_participants', filter: `user_id=eq.${user.id}` },
        () => {
          refreshChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatsChannel);
    };
  }, [user, refreshChats]);

  useEffect(() => {
    if (!selectedChatId) return;

    // Realtime for new messages in selected chat
    const msgChannel = supabase
      .channel(`messages-${selectedChatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${selectedChatId}` },
        () => {
          fetchMessages(selectedChatId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [selectedChatId, fetchMessages]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    refreshChats();
  }, [user, refreshChats]);

  return {
    chats,
    selectedChat,
    selectedChatId,
    setSelectedChatId,
    newMessage: internalDraft,
    setNewMessage,
    sendMessage,
    refreshChats,
    openSupportChat,
    openVendorChatByEmail,
  };
};

export type { Chat, ChatMessage } from '@/types/chat';
