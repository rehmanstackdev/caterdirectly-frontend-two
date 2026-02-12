
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Clock,
  CheckCircle,
  HeadphonesIcon,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/auth';
import { formatRelativeTime } from '@/utils/time-utils';
import { useVendorChat } from '@/hooks/use-vendor-chat';
import { useToast } from '@/hooks/use-toast';
import { ConversationSkeleton } from '@/components/ui/conversation-skeleton';
import supportService, { SupportCategoryEnum, SupportPriorityEnum } from '@/services/api/support.service';
import ordersService, { type OrderInvoice } from '@/services/api/orders.service';
import userService from '@/services/api/user.service';

const VendorMessagingHub: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    threads, 
    loading, 
    sendMessage, 
    markAsRead,
    startChatWithAdmin,
    refreshThreads
  } = useVendorChat();
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    orderId: ''
  });
  const [orders, setOrders] = useState<OrderInvoice[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [startingChat, setStartingChat] = useState<string | null>(null);
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

  // Load orders when support form opens
  useEffect(() => {
    if (showSupportForm && orders.length === 0) {
      loadOrders();
    }
  }, [showSupportForm]);

  // Load super admins when modal opens
  useEffect(() => {
    if (showAdminModal && superAdmins.length === 0) {
      loadSuperAdmins();
    }
  }, [showAdminModal]);

  const loadSuperAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await userService.getSuperAdmins();
      if (response && response.data) {
        setSuperAdmins(response.data);
      } else {
        setSuperAdmins([]);
      }
    } catch (error: any) {
      console.error('Error loading super admins:', error);
      setSuperAdmins([]);
      toast({
        title: "Error",
        description: "Failed to load admins. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadOrders = async () => {
    if (!user?.id) {
      console.log('No user ID available, user:', user);
      setLoadingOrders(false);
      return;
    }

    console.log('Loading orders for user ID:', user.id);
    setLoadingOrders(true);
    try {
      // Use the new GET /orders?createdBy={userId} endpoint
      const response = await ordersService.getOrdersByCreator(user.id);
      console.log('Orders API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response.data:', response?.data);
      console.log('Is array?', Array.isArray(response));
      
      // Backend returns: {status: 200, response: "OK", message: "...", data: [...]}
      if (response && response.data) {
        console.log('Setting orders from response.data:', response.data);
        console.log('Orders count:', response.data.length);
        setOrders(response.data);
      } else if (Array.isArray(response)) {
        console.log('Setting orders from array response:', response);
        console.log('Orders count:', response.length);
        setOrders(response);
      } else {
        console.log('No valid response, setting empty array');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      console.error('Error details:', error.response?.data);
      setOrders([]);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmitSupport = async () => {
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Map form values to backend enums
      const categoryMap: Record<string, SupportCategoryEnum> = {
        'general': SupportCategoryEnum.GENERAL_SUPPORT,
        'technical': SupportCategoryEnum.TECHNICAL_ISSUE,
        'billing': SupportCategoryEnum.BILLING_PAYMENT,
        'account': SupportCategoryEnum.ACCOUNT_MANAGEMENT,
      };

      const priorityMap: Record<string, SupportPriorityEnum> = {
        'low': SupportPriorityEnum.LOW,
        'medium': SupportPriorityEnum.MEDIUM,
        'high': SupportPriorityEnum.HIGH,
        'urgent': SupportPriorityEnum.URGENT,
      };

      const response = await supportService.createSupportTicket({
        category: categoryMap[supportForm.category],
        priority: priorityMap[supportForm.priority],
        subject: supportForm.subject,
        message: supportForm.message,
        orderId: supportForm.orderId || undefined,
      });

      console.log('Create support ticket response:', response);

      // Backend returns: {status: 201, response: "CREATED", message: "...", data: {...}}
      if (response && (response.status === 201 || response.data)) {
        toast({
          title: "Support request submitted",
          description: "We'll respond within 24 hours. Check your messages for updates."
        });

        setShowSupportForm(false);
        setSupportForm({
          subject: '',
          category: 'general',
          priority: 'medium',
          message: '',
          orderId: ''
        });
        
        refreshThreads();
      } else {
        throw new Error(response?.message || 'Failed to submit support request');
      }
    } catch (error: any) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit support request. Please try again.",
        variant: "destructive"
      });
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Order discussions and Cater Directly support</p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {totalUnreadCount} unread
            </Badge>
          )}
          <Button 
            onClick={() => setShowAdminModal(true)}
            className="bg-[#F07712] hover:bg-[#F07712]/90"
          >
            <HeadphonesIcon className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[530px]">
        {/* Conversation List */}
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
                  <ConversationSkeleton />
                ) : filteredThreads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Customer inquiries will appear here</p>
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

        {/* Chat Area */}
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
                {/* Messages */}
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
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message... (Shift + Enter for new line)"
                      value={newMessage}

                      onChange={(e) => setNewMessage(e.target.value)}
                      className=" min-h-10 max-h-10 resize-none"
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

      {/* Empty State */}
      {threads.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-4">
              Conversations with event hosts and Cater Directly support will appear here.
            </p>
            <p className="text-sm text-gray-500">
              Messages are automatically created from support tickets and customer inquiries.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Super Admin Selection Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Select an admin to start a conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loadingAdmins ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : superAdmins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No admins available
              </div>
            ) : (
              superAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className={`p-3 rounded-lg border hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                    startingChat === admin.id ? 'opacity-50' : ''
                  }`}
                  onClick={async () => {
                    if (startingChat) return;
                    setStartingChat(admin.id);
                    try {
                      await startChatWithAdmin(admin.id);
                      setShowAdminModal(false);
                    } finally {
                      setStartingChat(null);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{`${admin.firstName || ''} ${admin.lastName || ''}`.trim()}</p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {startingChat === admin.id && (
                      <span className="text-xs text-gray-500">Starting...</span>
                    )}
                    <Badge variant="secondary">Admin</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Support Dialog */}
      <Dialog open={showSupportForm} onOpenChange={setShowSupportForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Cater Directly Support</DialogTitle>
            <DialogDescription>
              Submit a support request and we'll respond within 24 hours
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={supportForm.category}
                  onChange={(e) => setSupportForm({...supportForm, category: e.target.value})}
                >
                  <option value="general">General Support</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="account">Account Management</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={supportForm.priority}
                  onChange={(e) => setSupportForm({...supportForm, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Order / Invoice (Optional)</label>
              <select
                className="w-full p-2 border rounded-md bg-background"
                value={supportForm.orderId}
                onChange={(e) => setSupportForm({...supportForm, orderId: e.target.value})}
                disabled={loadingOrders}
              >
                <option value="">None - General inquiry</option>
                {loadingOrders ? (
                  <option disabled>Loading orders...</option>
                ) : orders.length > 0 ? (
                  orders.map(order => {
                    const eventName = order.invoice?.eventName || 'Unnamed Event';
                    const contactName = order.invoice?.contactName || 'Unknown Contact';
                    
                    return (
                      <option key={order.id} value={order.id}>
                        {eventName} - {contactName}
                      </option>
                    );
                  })
                ) : (
                  <option disabled>No pending orders found</option>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Only pending orders are shown. Select one if your issue is related to a specific invoice.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                value={supportForm.subject}
                onChange={(e) => setSupportForm({...supportForm, subject: e.target.value})}
                placeholder="Brief description of your issue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea
                value={supportForm.message}
                onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                placeholder="Please provide detailed information"
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupportForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSupport}
              className="bg-[#F07712] hover:bg-[#F07712]/90"
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorMessagingHub;
