
import { BadgeCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Chat } from '@/hooks/use-chat';

interface ChatMessagesProps {
  chat: Chat;
}

const ChatMessages = ({ chat }: ChatMessagesProps) => {
  return (
    <Card className="h-full flex flex-col backdrop-blur-sm bg-white/50 border border-[#FFE4D6]">
      <CardHeader className="border-b border-[#FFE4D6]">
        <div className="flex items-center gap-4">
          <Avatar className={cn("h-12 w-12", chat.isSupport && "border-2 border-[#FF7F50]")}>
            <AvatarImage src={chat.image} alt={chat.name} />
            <AvatarFallback className={chat.isSupport ? "bg-[#FF7F50] text-white" : "bg-gray-100"}>
              {chat.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold">{chat.name}</h3>
              {chat.isSupport && (
                <BadgeCheck className="h-4 w-4 text-[#FF7F50]" />
              )}
            </div>
            <p className="text-sm text-[#FF7F50]">Online</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 mb-4 p-4 no-scrollbar">
          {chat.messages.map((message) => (
            <div key={message.id} 
              className={cn(
                "flex items-start gap-3",
                message.senderId === 'user1' && "flex-row-reverse"
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={message.senderImage} alt={message.senderName} />
                <AvatarFallback className={message.isSupport ? "bg-[#FF7F50] text-white" : "bg-gray-100"}>
                  {message.senderName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "p-4 rounded-2xl max-w-[80%]",
                message.senderId === 'user1' 
                  ? "bg-[#FF7F50] rounded-tr-none" 
                  : "bg-[#FFF5F0] rounded-tl-none"
              )}>
                <div className="flex items-center gap-1">
                  <p className={cn(
                    message.senderId === 'user1' ? "text-white" : "text-gray-800"
                  )}>{message.content}</p>
                  {message.isSupport && (
                    <BadgeCheck className="h-4 w-4 text-[#FF7F50]" />
                  )}
                </div>
                <p className={cn(
                  "text-xs mt-1",
                  message.senderId === 'user1' ? "text-white/70" : "text-gray-500"
                )}>{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatMessages;
