import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  User, 
  Calendar, 
  Paperclip, 
  Send, 
  Phone, 
  Video, 
  Clock, 
  CheckCircle, 
  File
} from 'lucide-react';

// Mock conversation data
interface Message {
  id: string;
  sender: 'vendor' | 'client' | 'system';
  text: string;
  time: string;
  read: boolean;
  attachment?: {
    type: 'image' | 'document';
    name: string;
    url: string;
  };
}

interface Conversation {
  id: string;
  clientName: string;
  clientAvatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  eventType?: string;
  eventDate?: string;
  eventStatus?: 'upcoming' | 'completed' | 'cancelled';
  orderId?: string;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: '1',
    clientName: 'Emily Chen',
    lastMessage: "That sounds perfect! We will confirm those details.",
    time: '10:34 AM',
    unread: 0,
    eventType: 'Corporate Lunch',
    eventDate: '2025-05-15',
    eventStatus: 'upcoming',
    orderId: 'ORD-2871',
    messages: [
      {
        id: '101',
        sender: 'client',
        text: "Hi there! I'm interested in booking your bartending services for our corporate event.",
        time: '9:21 AM',
        read: true
      },
      {
        id: '102',
        sender: 'vendor',
        text: "Hello Emily! Thank you for your interest. I'd be happy to help with your corporate event. Could you tell me more about it - date, expected guest count, and any specific requirements?",
        time: '9:30 AM',
        read: true
      },
      {
        id: '103',
        sender: 'client',
        text: "Great! The event is on May 15, 2025, with about 50 attendees. We're looking for a premium bartender for a 4-hour service from 12pm-4pm.",
        time: '9:45 AM',
        read: true
      },
      {
        id: '104',
        sender: 'vendor',
        text: "Perfect! We have availability on May 15. For 50 guests, I recommend our Premium package with 2 bartenders to ensure everyone is served promptly. We can provide a full bar setup including signature cocktails. Would you like to see our menu options?",
        time: '10:02 AM',
        read: true
      },
      {
        id: '105',
        sender: 'client',
        text: "That sounds perfect! We will confirm those details.",
        time: '10:34 AM',
        read: true
      }
    ]
  },
  {
    id: '2',
    clientName: 'Mike Johnson',
    lastMessage: "Looking forward to working with you on Saturday!",
    time: 'Yesterday',
    unread: 2,
    eventType: 'Birthday Party',
    eventDate: '2025-05-03',
    eventStatus: 'upcoming',
    orderId: 'ORD-2872',
    messages: [
      {
        id: '201',
        sender: 'client',
        text: "Hello, I need a DJ for my birthday party next Saturday.",
        time: '3:15 PM',
        read: true
      },
      {
        id: '202',
        sender: 'vendor',
        text: "Hi Mike, thanks for reaching out! I'd be happy to help with your birthday party. Could you provide more details about the event?",
        time: '3:30 PM',
        read: true
      },
      {
        id: '203',
        sender: 'client',
        text: "It's a 30th birthday party, about 40 guests, and we're looking for someone who can play a mix of 90s and current hits.",
        time: '4:00 PM',
        read: true
      },
      {
        id: '204',
        sender: 'vendor',
        text: "That sounds like a great party! I'm available on May 3rd and specialize in mixed era playlists. Would you like me to send our standard package options?",
        time: '4:10 PM',
        read: true
      },
      {
        id: '205',
        sender: 'client',
        text: "Yes please! Also, do you have any lighting equipment?",
        time: 'Yesterday',
        read: false
      },
      {
        id: '206',
        sender: 'vendor',
        text: "Absolutely! Our Premium DJ package includes basic lighting setup. For an additional fee, we can provide advanced lighting effects like moving heads and lasers. I'll send the full pricing details.",
        time: 'Yesterday',
        read: false
      },
      {
        id: '207',
        sender: 'client',
        text: "Looking forward to working with you on Saturday!",
        time: 'Yesterday',
        read: false
      }
    ]
  },
  {
    id: '3',
    clientName: 'Sarah Lopez',
    lastMessage: "Thanks for the amazing service last weekend!",
    time: 'Apr 25',
    unread: 0,
    eventType: 'Wedding Reception',
    eventDate: '2025-04-22',
    eventStatus: 'completed',
    orderId: 'ORD-2865',
    messages: [
      {
        id: '301',
        sender: 'client',
        text: "Thanks for the amazing service last weekend! Our guests loved the bartenders.",
        time: 'Apr 25',
        read: true
      }
    ]
  }
];

// Quick response templates
const quickResponses = [
  "Thanks for your message! I'll check availability and get back to you shortly.",
  "Would you like me to send you our complete pricing and package information?",
  "I've attached our service agreement for your review.",
  "Could you provide more details about your event requirements?",
  "I'm available for a call to discuss this further if you'd prefer."
];

const VendorMessaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  
  // Filter conversations based on active tab and search term
  const filteredConversations = conversations.filter(conversation => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'upcoming' && conversation.eventStatus === 'upcoming') ||
      (activeTab === 'completed' && conversation.eventStatus === 'completed');
      
    const matchesSearch = 
      conversation.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.eventType?.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesTab && matchesSearch;
  });
  
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowQuickResponses(false);
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, we would send this message to an API
    console.log('Sending message:', newMessage);
    
    // Clear the message input
    setNewMessage('');
    setShowQuickResponses(false);
  };
  
  const handleQuickResponseSelect = (response: string) => {
    setNewMessage(response);
    setShowQuickResponses(false);
  };
  
  return (
    <div className="h-[75vh] flex flex-col md:flex-row bg-white border rounded-lg overflow-hidden">
      {/* Conversation List */}
      <div className="w-full md:w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-3 mb-2 rounded-lg cursor-pointer ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-[#F07712]/10 border-[#F07712]'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {conversation.clientAvatar ? (
                        <img 
                          src={conversation.clientAvatar} 
                          alt={conversation.clientName}
                          className="h-10 w-10 rounded-full" 
                        />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{conversation.clientName}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {conversation.eventType || 'No event'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {conversation.time}
                    {conversation.unread > 0 && (
                      <div className="h-5 w-5 rounded-full bg-[#F07712] text-white flex items-center justify-center mt-1 ml-auto">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm mt-1 truncate">{conversation.lastMessage}</p>
                
                <div className="mt-1 flex justify-between">
                  {conversation.eventStatus && (
                    <Badge 
                      className={`
                        ${conversation.eventStatus === 'upcoming' ? 'bg-blue-100 text-blue-800' : ''}
                        ${conversation.eventStatus === 'completed' ? 'bg-green-100 text-green-800' : ''}
                        ${conversation.eventStatus === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {conversation.eventStatus}
                    </Badge>
                  )}
                  
                  {conversation.orderId && (
                    <span className="text-xs text-gray-500">{conversation.orderId}</span>
                  )}
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-6">
                <MessageCircle className="h-8 w-8 text-gray-300 mx-auto" />
                <p className="mt-2 text-gray-500">No conversations found</p>
              </div>
            )}
          </div>
        </Tabs>
      </div>
      
      {/* Message Area */}
      <div className="w-full md:w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{selectedConversation.clientName}</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{selectedConversation.eventType}</span>
                  {selectedConversation.eventDate && (
                    <span className="flex items-center ml-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(selectedConversation.eventDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {selectedConversation.messages.map(message => (
                <div 
                  key={message.id} 
                  className={`max-w-[80%] mb-4 ${
                    message.sender === 'vendor' ? 'ml-auto' : ''
                  }`}
                >
                  <div 
                    className={`p-3 rounded-lg ${
                      message.sender === 'vendor' 
                        ? 'bg-[#F07712]/10 text-gray-800' 
                        : message.sender === 'system'
                        ? 'bg-gray-100 text-gray-600 border border-gray-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.attachment && (
                      <div className="mb-2 p-2 bg-white rounded border flex items-center">
                        <File className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">{message.attachment.name}</span>
                      </div>
                    )}
                    <p>{message.text}</p>
                  </div>
                  <div className="flex items-center justify-end mt-1">
                    <p className="text-xs text-gray-500">{message.time}</p>
                    {message.sender === 'vendor' && (
                      <CheckCircle 
                        className={`h-3 w-3 ml-1 ${
                          message.read ? 'text-green-500' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="p-3 border-t">
              {showQuickResponses && (
                <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border bg-white shadow-sm">
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-gray-500 mb-1">QUICK RESPONSES</h4>
                    {quickResponses.map((response, index) => (
                      <div 
                        key={index}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
                        onClick={() => handleQuickResponseSelect(response)}
                      >
                        {response}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="pr-24"
                  onFocus={() => setShowQuickResponses(false)}
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost"
                    onClick={() => setShowQuickResponses(!showQuickResponses)}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    size="icon"
                    disabled={!newMessage.trim()} 
                    onClick={handleSendMessage}
                    className="bg-[#F07712] hover:bg-[#F07712]/90 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Your Messages</h2>
              <p className="mt-2 text-gray-500 max-w-sm">
                Select a conversation to view messages or search for a specific client.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorMessaging;
