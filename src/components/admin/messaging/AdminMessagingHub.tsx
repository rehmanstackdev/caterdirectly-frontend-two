import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  CheckCircle,
  HeadphonesIcon,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { formatRelativeTime } from '@/utils/time-utils';
import { useAdminChat } from '@/hooks/use-admin-chat';
import NewConversationDialog from '@/components/chat/NewConversationDialog';

interface AdminMessagingHubProps {
  customHook?: any;
}

const AdminMessagingHub: React.FC<AdminMessagingHubProps> = ({ customHook }) => {
  const { user } = useAuth();
  const defaultHook = useAdminChat();
  const { 
    threads, 
    loading, 
    sendMessage, 
    markAsRead,
    startChatWithAdmin,
    startChatWithVendor
  } = customHook || defaultHook;
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedThread = threads.find(t => t.id === selectedThreadId);

  const handleSendMessage = async () => {
    if (!selectedThreadId || !newMessage.trim()) return;
    await sendMessage(selectedThreadId, newMessage);
    setNewMessage('');
  };

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    markAsRead(threadId);
  };

  // Auto scroll to bottom when thread changes
  useEffect(() => {
    if (selectedThread && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedThread?.id, selectedThread?.messages.length]);

  const filteredThreads = threads.filter(thread =>
    thread.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.last_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnreadCount = threads.reduce((sum, thread) => sum + thread.unread_count, 0);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Platform communications and support tickets</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {totalUnreadCount} unread
            </Badge>
          )}
          {(startChatWithAdmin || startChatWithVendor) && (
            <NewConversationDialog 
              onOpenSupport={startChatWithAdmin || (() => {})}
              onOpenVendorByEmail={startChatWithVendor || (() => {})}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Badge variant="secondary">
                {threads.length} total
              </Badge>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-3 border-l-4 border-l-transparent">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : filteredThreads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Support tickets will appear here</p>
                  </div>
                ) : (
                  filteredThreads.map(thread => (
                    <div
                      key={thread.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                        selectedThreadId === thread.id 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : thread.unread_count > 0 
                            ? 'border-l-orange-500' 
                            : 'border-l-transparent'
                      }`}
                      onClick={() => handleSelectThread(thread.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          {thread.participant_image_url ? (
                            <img 
                              src={thread.participant_image_url} 
                              alt={thread.participant_name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{thread.participant_name}</p>
                            {thread.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs h-5 w-5 flex items-center justify-center">
                                {thread.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">{thread.last_message}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(thread.last_message_time)}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {thread.participant_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedThread ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    {selectedThread.participant_image_url ? (
                      <img 
                        src={selectedThread.participant_image_url} 
                        alt={selectedThread.participant_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedThread.participant_name}</h3>
                    <p className="text-sm text-gray-600">{selectedThread.participant_email}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-[450px] p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedThread.messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.id
                              ? 'bg-[#F07712] text-white'
                              : message.message_type === 'support'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {message.sender_name}
                            </span>
                            {message.message_type === 'support' && (
                              <HeadphonesIcon className="h-3 w-3" />
                            )}
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs ${
                              message.sender_id === user?.id ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {formatRelativeTime(message.created_at)}
                            </span>
                            {message.sender_id === user?.id && (
                              <CheckCircle className="h-3 w-3 text-orange-100" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t px-6 py-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message... (Shift + Enter for new line)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="h-10 max-h-10 min-h-10 resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-[#F07712] hover:bg-[#F07712]/90 self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                 
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {threads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-4">
              Support tickets and platform communications will appear here.
            </p>
            <p className="text-sm text-gray-500">
              Messages are automatically created from support tickets and user inquiries.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMessagingHub;