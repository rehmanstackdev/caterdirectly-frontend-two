import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  HeadphonesIcon, 
  MessageSquare, 
  FileText, 
  Phone, 
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Send,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useVendorSupport } from '@/hooks/vendor/use-vendor-support';

const VendorSupportCenter: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tickets, faqs, loading, submitting, submitSupportRequest } = useVendorSupport();
  const [activeTab, setActiveTab] = useState<'contact' | 'tickets' | 'faq'>('contact');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });
  const [searchTerm, setSearchTerm] = useState('');


  const handleSubmitSupportRequest = async () => {
    if (!supportForm.subject.trim() || !supportForm.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }

    const success = await submitSupportRequest(supportForm);
    if (success) {
      setSupportForm({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Support Center</h2>
          <p className="text-gray-600">Get help and support for your vendor account</p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('contact')}>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-[#F07712] mx-auto mb-2" />
            <h3 className="font-semibold">Contact Support</h3>
            <p className="text-sm text-gray-600">Submit a support request</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('tickets')}>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold">Your Tickets</h3>
            <p className="text-sm text-gray-600">Track your support requests</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('faq')}>
          <CardContent className="p-4 text-center">
            <HelpCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold">FAQ</h3>
            <p className="text-sm text-gray-600">Find quick answers</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'contact', label: 'Contact Support', icon: MessageSquare },
            { id: 'tickets', label: 'Your Tickets', icon: FileText },
            { id: 'faq', label: 'FAQ', icon: HelpCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-[#F07712] text-[#F07712]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contact Support Tab */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Support Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="w-full p-2 border rounded-md"
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
                      className="w-full p-2 border rounded-md"
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
                    placeholder="Please provide detailed information about your issue"
                    rows={6}
                  />
                </div>
                
                <Button 
                  onClick={handleSubmitSupportRequest} 
                  disabled={submitting}
                  className="bg-[#F07712] hover:bg-[#F07712]/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#F07712]" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@caterdirectly.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#F07712]" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">1-800-CATER-US</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#F07712]" />
                  <div>
                    <p className="font-medium">Business Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Low Priority</span>
                  <span className="text-sm text-gray-600">72 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Medium Priority</span>
                  <span className="text-sm text-gray-600">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">High Priority</span>
                  <span className="text-sm text-gray-600">8 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Urgent</span>
                  <span className="text-sm text-gray-600">2 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading tickets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.admin_response || 'Awaiting response...'}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Ticket #{ticket.id.slice(0, 8)}</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                
                {tickets.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No support tickets yet</p>
                    <p className="text-sm text-gray-400">Submit a request above to get started</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-4">
            {filteredFAQs.map(faq => (
              <Card key={faq.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-600 mb-3">{faq.answer}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{faq.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CheckCircle className="h-4 w-4" />
                        {faq.helpful_count} found this helpful
                      </div>
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorSupportCenter;