
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, File, MessageSquare, Phone, Plus, Search, Send, User } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'inquiry' | 'order' | 'support' | 'feedback';
  attachments?: string[];
}

interface QuickTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'inquiry' | 'follow-up' | 'thank-you' | 'custom';
}

const CommunicationCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [replyText, setReplyText] = useState('');
  const [templates] = useState<QuickTemplate[]>([
    {
      id: '1',
      name: 'Initial Inquiry Response',
      subject: 'Thank you for your catering inquiry',
      body: 'Thank you for reaching out about our catering services. I\'d love to help make your event special. Let me know your event details and I\'ll provide a customized proposal.',
      category: 'inquiry'
    },
    {
      id: '2',
      name: 'Follow-up After Quote',
      subject: 'Following up on your catering quote',
      body: 'I wanted to follow up on the catering proposal I sent last week. Do you have any questions about our services or would you like to discuss any modifications?',
      category: 'follow-up'
    },
    {
      id: '3',
      name: 'Event Confirmation',
      subject: 'Your catering order is confirmed!',
      body: 'Great news! Your catering order has been confirmed. I\'ll be in touch closer to your event date to finalize all the details.',
      category: 'follow-up'
    },
    {
      id: '4',
      name: 'Thank You Post-Event',
      subject: 'Thank you for choosing our catering services',
      body: 'Thank you for allowing us to be part of your special event. I hope everything exceeded your expectations. I\'d love to hear your feedback!',
      category: 'thank-you'
    }
  ]);

  useEffect(() => {
    // Mock data - in real app would fetch from database
    const mockMessages: Message[] = [
      {
        id: '1',
        clientId: '1',
        clientName: 'Sarah Johnson',
        subject: 'Catering inquiry for corporate event',
        preview: 'Hi, I\'m looking for catering services for our upcoming corporate retreat...',
        timestamp: '2024-01-22T10:30:00Z',
        isRead: false,
        priority: 'high',
        type: 'inquiry',
        attachments: ['event_details.pdf']
      },
      {
        id: '2',
        clientId: '2',
        clientName: 'Michael Chen',
        subject: 'Menu modification request',
        preview: 'Could we adjust the menu to include more vegetarian options...',
        timestamp: '2024-01-22T08:15:00Z',
        isRead: true,
        priority: 'medium',
        type: 'order'
      },
      {
        id: '3',
        clientId: '3',
        clientName: 'Emily Rodriguez',
        subject: 'Thank you for amazing service!',
        preview: 'The wedding catering was absolutely perfect. All our guests...',
        timestamp: '2024-01-21T16:45:00Z',
        isRead: true,
        priority: 'low',
        type: 'feedback'
      },
      {
        id: '4',
        clientId: '4',
        clientName: 'David Kim',
        subject: 'Urgent: Event date change needed',
        preview: 'We need to move our event from March 15th to March 22nd...',
        timestamp: '2024-01-21T14:20:00Z',
        isRead: false,
        priority: 'urgent',
        type: 'support'
      }
    ];
    
    setMessages(mockMessages);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inquiry': return <MessageSquare className="h-4 w-4" />;
      case 'order': return <File className="h-4 w-4" />;
      case 'support': return <Phone className="h-4 w-4" />;
      case 'feedback': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || message.type === filterType;
    return matchesSearch && matchesType;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const urgentCount = messages.filter(m => m.priority === 'urgent').length;

  const MessageItem = ({ message }: { message: Message }) => (
    <div 
      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${!message.isRead ? 'bg-blue-50' : ''}`}
      onClick={() => setSelectedMessage(message)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={message.clientAvatar} alt={message.clientName} />
            <AvatarFallback>{message.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className={`font-medium ${!message.isRead ? 'font-semibold' : ''}`}>{message.clientName}</h4>
            <p className="text-sm text-gray-600">{message.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(message.priority)} variant="outline">
            {message.priority}
          </Badge>
          {getTypeIcon(message.type)}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-2 truncate">{message.preview}</p>
      
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{format(new Date(message.timestamp), 'MMM d, h:mm a')}</span>
        {message.attachments && message.attachments.length > 0 && (
          <span className="flex items-center gap-1">
            <File className="h-3 w-3" />
            {message.attachments.length}
          </span>
        )}
      </div>
    </div>
  );

  const handleSendReply = () => {
    if (replyText.trim() && selectedMessage) {
      // In real app, would send message via API
      console.log('Sending reply:', replyText);
      setReplyText('');
      // Mark message as read
      setMessages(messages.map(m => 
        m.id === selectedMessage.id ? { ...m, isRead: true } : m
      ));
    }
  };

  const useTemplate = (template: QuickTemplate) => {
    setReplyText(template.body);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Communication Center</h2>
          <p className="text-gray-600">Manage all client communications in one place</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Client name or email" />
              <Input placeholder="Subject" />
              <Textarea placeholder="Your message..." rows={6} />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Save as Draft</Button>
                <Button className="bg-[#F07712] hover:bg-[#F07712]/90">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent Messages</p>
                <p className="text-2xl font-bold">{urgentCount}</p>
              </div>
              <Clock className="h-8 w-8 text-red-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">2.3h</p>
              </div>
              <Clock className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Messages</p>
                <p className="text-2xl font-bold">{messages.filter(m => format(new Date(m.timestamp), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="order">Order</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map(message => (
                  <MessageItem key={message.id} message={message} />
                ))}
                {filteredMessages.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No messages found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedMessage ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={selectedMessage.clientAvatar} alt={selectedMessage.clientName} />
                        <AvatarFallback>{selectedMessage.clientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedMessage.clientName}</h3>
                        <p className="text-sm text-gray-600">{selectedMessage.subject}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(selectedMessage.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{selectedMessage.preview}</p>
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-sm font-medium mb-2">Attachments:</p>
                      {selectedMessage.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                          <File className="h-4 w-4" />
                          {attachment}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <File className="h-4 w-4 mr-1" />
                        Attach File
                      </Button>
                      <Select onValueChange={(value) => {
                        const template = templates.find(t => t.id === value);
                        if (template) useTemplate(template);
                      }}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Use template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map(template => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleSendReply}
                      disabled={!replyText.trim()}
                      className="bg-[#F07712] hover:bg-[#F07712]/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Select a message to view and reply</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;
