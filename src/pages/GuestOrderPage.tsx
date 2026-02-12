import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InvitationData {
  id: string;
  email: string;
  token: string;
  type: string;
  order_id: string;
  event_id: string | null;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

interface OrderData {
  id: string;
  title: string;
  location: string;
  date: string;
  guests: number;
  host_id: string;
  vendor_name: string;
  price: number;
  status: string;
}

const GuestOrderPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInvitationData();
    }
  }, [token]);

  const fetchInvitationData = async () => {
    try {
      setLoading(true);
      
      // Fetch invitation token data
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitation_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'group_order')
        .single();

      if (invitationError) {
        if (invitationError.code === 'PGRST116') {
          setError('Invalid or expired invitation link.');
        } else {
          throw invitationError;
        }
        return;
      }

      // Check if token is expired
      if (new Date(invitationData.expires_at) < new Date()) {
        setError('This invitation has expired.');
        return;
      }

      // Check if token is already used
      if (invitationData.is_used) {
        setError('This invitation has already been used.');
        return;
      }

      setInvitation(invitationData);

      // Fetch order data
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', invitationData.order_id)
        .single();

      if (orderError) {
        throw orderError;
      }

      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching invitation data:', err);
      setError('Failed to load invitation details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!invitation || !order) return;

    try {
      // Mark invitation as used
      const { error: updateError } = await supabase
        .from('invitation_tokens')
        .update({ is_used: true })
        .eq('id', invitation.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Invitation accepted! You can now place your order.');
      
      // Redirect to order form or marketplace with pre-filled data
      navigate(`/marketplace?order_id=${order.id}&invitation_token=${token}`);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      toast.error('Failed to accept invitation.');
    }
  };

  const handleDeclineInvitation = async () => {
    if (!invitation) return;

    try {
      // Mark invitation as used (declined)
      const { error: updateError } = await supabase
        .from('invitation_tokens')
        .update({ is_used: true })
        .eq('id', invitation.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Invitation declined.');
      navigate('/');
    } catch (err) {
      console.error('Error declining invitation:', err);
      toast.error('Failed to decline invitation.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F07712] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Invalid Invitation</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Group Order Invitation</h1>
          <p className="text-gray-600">You've been invited to join a group catering order</p>
        </div>

        {order && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{order.title}</CardTitle>
                <Badge variant="outline" className="text-[#F07712] border-[#F07712]">
                  Group Order
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Event Date</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">{order.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Expected Guests</p>
                    <p className="text-sm text-gray-600">{order.guests} people</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Catering By</p>
                    <p className="text-sm text-gray-600">{order.vendor_name}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Invited to:</p>
                <p className="font-medium">{invitation?.email}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">Join This Group Order</h3>
              <p className="text-gray-600">
                Accept this invitation to participate in the group catering order. 
                You'll be able to select your individual meal preferences.
              </p>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={handleDeclineInvitation}
                  className="flex-1"
                >
                  Decline
                </Button>
                <Button 
                  onClick={handleAcceptInvitation}
                  className="flex-1 bg-[#F07712] hover:bg-[#F07712]/90"
                >
                  Accept & Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            This invitation expires on {invitation && new Date(invitation.expires_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderPage;