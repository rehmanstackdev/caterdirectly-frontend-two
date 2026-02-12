import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MessageCircle, Users } from 'lucide-react';

interface NewConversationDialogProps {
  onStartSupportChat: () => void;
  onStartVendorChat?: (email: string) => void;
}

const NewConversationDialog = ({ onStartSupportChat, onStartVendorChat }: NewConversationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [vendorEmail, setVendorEmail] = useState('');

  const handleStartSupport = () => {
    onStartSupportChat();
    setOpen(false);
  };

  const handleStartVendorChat = () => {
    if (vendorEmail.trim() && onStartVendorChat) {
      onStartVendorChat(vendorEmail.trim());
      setVendorEmail('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#F07712] hover:bg-[#E06600]">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Support Chat Option */}
          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <MessageCircle className="h-5 w-5 text-[#F07712]" />
              <h3 className="font-medium">Contact Support</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Get help from our support team with any questions or issues.
            </p>
            <Button 
              onClick={handleStartSupport}
              className="w-full bg-[#F07712] hover:bg-[#E06600]"
            >
              Start Support Chat
            </Button>
          </div>

          {/* Vendor Chat Option */}
          {onStartVendorChat && (
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Contact Vendor</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Start a conversation with a vendor by entering their email.
              </p>
              <div className="space-y-2">
                <Label htmlFor="vendor-email">Vendor Email</Label>
                <Input
                  id="vendor-email"
                  type="email"
                  placeholder="vendor@example.com"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                />
                <Button 
                  onClick={handleStartVendorChat}
                  disabled={!vendorEmail.trim()}
                  className="w-full"
                  variant="outline"
                >
                  Start Vendor Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;