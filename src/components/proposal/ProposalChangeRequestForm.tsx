import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';

interface ProposalChangeRequestFormProps {
  proposal: any;
  onBack: () => void;
}

const ProposalChangeRequestForm = ({
  proposal,
  onBack
}: ProposalChangeRequestFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: proposal.client_name || '',
    clientEmail: proposal.client_email || '',
    requestedChanges: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.requestedChanges.trim()) {
      toast({
        title: "Error",
        description: "Please describe the changes you'd like",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('submit-invoice-change-request', {
        body: {
          token: proposal.token,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          requestedChanges: formData.requestedChanges
        }
      });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your change request has been submitted successfully.",
      });

      onBack();
    } catch (error: any) {
      console.error('Error submitting change request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit change request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <CardTitle>Request Changes to Invoice</CardTitle>
        <p className="text-muted-foreground">
          Please describe the changes you would like to make to this invoice.
          Our team will review your request and send you an updated proposal.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Your Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Your Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requestedChanges">Requested Changes</Label>
            <Textarea
              id="requestedChanges"
              placeholder="Please describe what you would like to change about this proposal. Include details about quantities, dates, services, or any other modifications you need."
              value={formData.requestedChanges}
              onChange={(e) => setFormData(prev => ({ ...prev, requestedChanges: e.target.value }))}
              rows={6}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Submit Change Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProposalChangeRequestForm;