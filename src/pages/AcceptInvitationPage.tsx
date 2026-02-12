import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  CalendarCheck,
  XCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import ordersService from '@/services/api/orders.service';
import { toast } from 'sonner';

function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const token = searchParams.get('token');
  const invitationStatus = searchParams.get('invitationStatus');
  const name = searchParams.get('name');
  const eventName = searchParams.get('eventName');
  const eventLocation = searchParams.get('eventLocation');
  const eventDate = searchParams.get('eventDate');
  const serviceTime = searchParams.get('serviceTime');

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const response = await ordersService.acceptInvitation(token);
      console.log(response);
      navigate('/');
      toast.success(' Invitation accepted successfully. You are now part of the event.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      const response = await ordersService.declineInvitation(token);
      console.log(response);
      navigate('/');
      toast.success(' Invitation declined successfully. You are not part of the event.');
    } catch (error) {
      console.error(error);
      toast.error('Failed to decline invitation');
    } finally {
      setIsDeclining(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
        <main className="flex-1 flex items-center justify-center p-4 bg-muted/30">
          <Card className="max-w-md w-full shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Invalid Invitation</CardTitle>
              <CardDescription className="mt-2">
                This invitation link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')} className="w-full" size="lg">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    if (status?.toLowerCase() === 'pending') return 'default';
    if (status?.toLowerCase() === 'accepted') return 'default';
    return 'secondary';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
          <Header />
        </div>
      </div>
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="max-w-2xl w-full shadow-xl border-0 overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-[hsl(27_88%_51%)] to-[hsl(27_88%_46%)] text-white">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserPlus className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl text-white">Invitation Details</CardTitle>
              </div>
              <CardDescription className="text-white/90 text-base">
                Review the event information below and accept or decline this invitation
              </CardDescription>
            </CardHeader>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Details Grid */}
            <div className="grid gap-4">
              {name && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-[hsl(27_88%_51%)]/10 rounded-lg">
                    <User className="h-5 w-5 text-[hsl(27_88%_51%)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold text-base">{name}</p>
                  </div>
                </div>
              )}

              {invitationStatus && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-[hsl(27_88%_51%)]/10 rounded-lg">
                    <CalendarCheck className="h-5 w-5 text-[hsl(27_88%_51%)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge 
                      variant={getStatusVariant(invitationStatus)}
                      className="capitalize text-sm px-3 py-1"
                    >
                      {invitationStatus}
                    </Badge>
                  </div>
                </div>
              )}

              {eventName && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-[hsl(27_88%_51%)]/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-[hsl(27_88%_51%)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Event Name</p>
                    <p className="font-semibold text-base">{eventName}</p>
                  </div>
                </div>
              )}

              {eventLocation && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-[hsl(27_88%_51%)]/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-[hsl(27_88%_51%)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Event Location</p>
                    <p className="font-semibold text-base">{eventLocation}</p>
                  </div>
                </div>
              )}

              {eventDate && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-[hsl(27_88%_51%)]/10 rounded-lg">
                    <CalendarCheck className="h-5 w-5 text-[hsl(27_88%_51%)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Event Date</p>
                    <p className="font-semibold text-base">
                      {new Date(eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              )}

              {serviceTime && (
                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100/50 transition-colors">
                  <div className="p-2 bg-[hsl(27_88%_51%)]/10 rounded-lg">
                    <Clock className="h-5 w-5 text-[hsl(27_88%_51%)]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Service Time</p>
                    <p className="font-semibold text-base">{serviceTime}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleDecline}
                disabled={isDeclining || isAccepting}
                className="flex-1 h-11 text-base font-medium hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                size="lg"
              >
                {isDeclining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </>
                )}
              </Button>
              <Button 
                onClick={handleAccept}
                disabled={isAccepting || isDeclining}
                className="flex-1 h-11 text-base font-medium bg-[hsl(27_88%_51%)] hover:bg-[hsl(27_88%_46%)] text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default AcceptInvitationPage;
