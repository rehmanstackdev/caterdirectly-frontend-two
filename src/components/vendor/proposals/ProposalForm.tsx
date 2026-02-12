
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ServiceItem } from '@/types/service-types';
import { Invoice, InvoiceItem } from '@/types/invoice-types';
import { ProposalServiceGrid } from '@/components/vendor/proposals/ProposalServiceGrid';
import { ProposalItemsList } from '@/components/vendor/proposals/ProposalItemsList';
import { CalendarIcon, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ProposalFormProps {
  proposal: Invoice;
  onProposalChange: (proposal: Partial<Invoice>) => void;
  onSendProposal: () => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({
  proposal,
  onProposalChange,
  onSendProposal
}) => {

  const handleAddServiceToProposal = (service: ServiceItem) => {
    // Parse the price string to number
    const priceString = service.price.replace(/[^0-9.]/g, '');
    const price = parseFloat(priceString);
    
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      price: price || 0,
      quantity: 1,
      total: price || 0,
    };

    const updatedItems = [...proposal.items, newItem];
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    onProposalChange({ 
      items: updatedItems,
      total: newTotal 
    });
  };

  const handleUpdateItem = (updatedItem: InvoiceItem) => {
    const updatedItems = proposal.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    onProposalChange({ 
      items: updatedItems,
      total: newTotal
    });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = proposal.items.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    onProposalChange({ 
      items: updatedItems,
      total: newTotal 
    });
  };

  const isFormValid = () => {
    return (
      proposal.title.trim() !== "" && 
      proposal.clientName.trim() !== "" && 
      proposal.clientEmail.trim() !== "" && 
      proposal.clientPhone.trim() !== "" && 
      proposal.items.length > 0
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Proposal Title</Label>
              <Input 
                id="title"
                value={proposal.title} 
                onChange={(e) => onProposalChange({ title: e.target.value })}
                placeholder="E.g., Wedding Catering Service"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input 
                  id="clientName"
                  value={proposal.clientName} 
                  onChange={(e) => onProposalChange({ clientName: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input 
                  id="clientEmail"
                  type="email"
                  value={proposal.clientEmail} 
                  onChange={(e) => onProposalChange({ clientEmail: e.target.value })}
                  placeholder="client@example.com"
                />
              </div>

              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input 
                  id="clientPhone"
                  type="tel"
                  value={proposal.clientPhone} 
                  onChange={(e) => onProposalChange({ clientPhone: e.target.value })}
                  placeholder="(123) 456-7890"
                />
              </div>

              <div>
                <Label htmlFor="clientCompany">Client Company (Optional)</Label>
                <Input 
                  id="clientCompany"
                  value={proposal.clientCompany || ""} 
                  onChange={(e) => onProposalChange({ clientCompany: e.target.value })}
                  placeholder="Company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Service Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {proposal.serviceDate ? (
                        format(proposal.serviceDate, "PPP")
                      ) : (
                        <span>Select service date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={proposal.serviceDate || undefined}
                      onSelect={(date) => onProposalChange({ serviceDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="serviceTime">Service Time (Optional)</Label>
                <div className="flex">
                  <Input 
                    id="serviceTime"
                    value={proposal.serviceTime || ""} 
                    onChange={(e) => onProposalChange({ serviceTime: e.target.value })}
                    placeholder="e.g., 6:00 PM - 10:00 PM"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="message">Message to Client</Label>
              <Textarea 
                id="message"
                value={proposal.message} 
                onChange={(e) => onProposalChange({ message: e.target.value })}
                placeholder="Add a personal message to your client..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
              <Textarea 
                id="deliveryNotes"
                value={proposal.deliveryNotes || ""} 
                onChange={(e) => onProposalChange({ deliveryNotes: e.target.value })}
                placeholder="Add any special instructions for delivery or setup..."
                rows={3}
              />
            </div>

            <div>
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {proposal.expiryDate ? (
                      format(proposal.expiryDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={proposal.expiryDate || undefined}
                    onSelect={(date) => onProposalChange({ expiryDate: date })}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {proposal.items.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Selected Services</h3>
            <ProposalItemsList 
              items={proposal.items} 
              onUpdateItem={handleUpdateItem} 
              onRemoveItem={handleRemoveItem} 
            />
            
            <div className="mt-6 flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>${proposal.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Add Services to Proposal</h3>
          
          <ProposalServiceGrid 
            proposal={proposal}
            onServiceSelect={handleAddServiceToProposal}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-2">
        <Button
          variant="default"
          size="lg"
          className="bg-[#F07712] hover:bg-[#F07712]/90"
          disabled={!isFormValid()}
          onClick={onSendProposal}
        >
          <Send className="mr-2 h-4 w-4" />
          Send Proposal
        </Button>
      </div>
    </div>
  );
};
