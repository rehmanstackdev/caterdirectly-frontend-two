
import React, { memo } from 'react';
import { BadgeCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Chat } from '@/types/chat';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}

// Memoize the individual chat item for better performance
const ChatItem = memo(({ 
  chat, 
  selectedChatId, 
  onSelectChat 
}: { 
  chat: Chat, 
  selectedChatId: string, 
  onSelectChat: (chatId: string) => void 
}) => {
  return (
    <div
      onClick={() => onSelectChat(chat.id)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer",
        selectedChatId === chat.id ? "bg-[#FFF5F0]" : "hover:bg-gray-50"
      )}
    >
      <Avatar className={cn("h-12 w-12", chat.isSupport && "border-2 border-[#FF7F50]")}>
        <AvatarImage src={chat.image} alt={chat.name} />
        <AvatarFallback className={chat.isSupport ? "bg-[#FF7F50] text-white" : "bg-gray-100"}>
          {chat.name.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-sm">{chat.name}</p>
          {chat.isSupport && (
            <BadgeCheck className="h-4 w-4 text-[#FF7F50]" />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className={cn(
          "text-xs",
          chat.unreadCount ? "font-medium text-[#FF7F50]" : "text-gray-500"
        )}>{chat.timestamp}</span>
        {chat.unreadCount && (
          <span className="h-5 w-5 rounded-full bg-[#FF7F50] text-white text-xs flex items-center justify-center mt-1">
            {chat.unreadCount}
          </span>
        )}
      </div>
    </div>
  );
});

// Main component which manages the chat list display
const ChatList = ({ chats, selectedChatId, onSelectChat }: ChatListProps) => {
  // Memoized search/filter function can be added here for performance
  return (
    <Card className="h-full overflow-hidden flex flex-col backdrop-blur-sm bg-white/50 border border-[#FFE4D6]">
      <CardHeader className="pb-3">
        <Input 
          type="search" 
          placeholder="Search conversations..." 
          className="h-10 rounded-full bg-white/80 border-[#FFE4D6] focus:border-[#FF7F50] focus:ring-[#FF7F50]"
        />
      </CardHeader>
      <CardContent className="space-y-3 flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <ChatItem 
            key={chat.id}
            chat={chat}
            selectedChatId={selectedChatId}
            onSelectChat={onSelectChat}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default memo(ChatList);
