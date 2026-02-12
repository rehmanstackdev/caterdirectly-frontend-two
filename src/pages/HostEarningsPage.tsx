
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '@/components/dashboard/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePayouts } from '@/hooks/usePayouts';
import { useStripeConnect } from '@/hooks/useStripeConnect';

const HostEarningsPage = () => {
  const navigate = useNavigate();
  const { payouts, loading } = usePayouts();
  const { status, loading: connectLoading, onboardingLoading, startOnboarding, refreshStatus } = useStripeConnect();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const now = new Date();
  const totalCents = payouts.reduce((sum, p) => sum + (p.amount_net || 0), 0);
  const pendingCents = payouts
    .filter(p => ['scheduled', 'processing', 'on_hold'].includes(p.status))
    .reduce((sum, p) => sum + (p.amount_net || 0), 0);
  const availableCents = payouts
    .filter(p => p.status === 'scheduled' && p.scheduled_for && new Date(p.scheduled_for) <= now)
    .reduce((sum, p) => sum + (p.amount_net || 0), 0);
  const feeCents = payouts.reduce((sum, p) => sum + (p.amount_fee || 0), 0);

  const earningsData = {
    totalEarnings: totalCents / 100,
    pendingPayouts: pendingCents / 100,
    availableForPayout: availableCents / 100,
    platformFees: feeCents / 100,
    transactions: payouts.map(p => ({
      id: p.id,
      source: p.source_type === 'ticket_sale' ? 'Ticket Sale' : 'Order',
      date: p.paid_at || p.scheduled_for,
      amount: (p.amount_net || 0) / 100,
      status: p.status,
    })),
    payouts: payouts,
  };
  
  return (
    <Dashboard activeTab="earnings" userRole="event-host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Earnings & Payouts</h1>
          <Button 
            onClick={() => navigate('/events/create')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create New Event
          </Button>
        </div>

        {payouts.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No payout records yet. Payouts are scheduled automatically after ticket sales settle.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(earningsData.totalEarnings)}</div>
              <p className="text-sm text-gray-500 mt-2">
                Lifetime earnings from all events
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Available for Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(earningsData.availableForPayout)}</div>
              <Button className="mt-4 w-full" size="sm" onClick={startOnboarding} disabled={onboardingLoading}>
                {onboardingLoading ? 'Opening...' : 'Request Payout'}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(earningsData.pendingPayouts)}</div>
              <p className="text-sm text-gray-500 mt-2">
                Will be available after events complete
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earningsData.transactions.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">
                          {t.source}
                        </TableCell>
                        <TableCell>{formatDate(t.date)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={t.status === 'paid' ? 'default' : t.status === 'on_hold' ? 'outline' : 'outline'}
                            className={t.status === 'paid' ? 'bg-green-500' : ''}
                          >
                            {t.status === 'paid' ? 'Paid' : t.status === 'on_hold' ? 'On Hold' : 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(t.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{formatDate(p.paid_at || p.scheduled_for)}</TableCell>
                        <TableCell>{p.source_type === 'ticket_sale' ? 'Ticket Sale' : 'Order'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={p.status === 'paid' ? 'default' : p.status === 'on_hold' ? 'outline' : 'outline'}
                            className={p.status === 'paid' ? 'bg-green-500' : ''}
                          >
                            {p.status === 'paid' ? 'Paid' : p.status === 'on_hold' ? 'On Hold' : 'Scheduled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((p.amount_net || 0) / 100)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle>Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-500">
              Connect your payout account to receive funds automatically after Eventbrite-style schedules.
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {connectLoading ? 'Checking status...' : (status?.payouts_enabled ? 'Payouts Enabled' : 'Payouts Not Enabled')}
              </Badge>
              <Badge variant="outline">
                {connectLoading ? 'Loading...' : (status?.details_submitted ? 'Onboarding Complete' : 'Onboarding Required')}
              </Badge>
              {status?.requirements_disabled_reason && (
                <Badge variant="outline">
                  Needs Attention
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={startOnboarding} disabled={onboardingLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {onboardingLoading ? 'Opening...' : (status?.details_submitted ? 'Update Payout Details' : 'Set Up Payouts')}
              </Button>
              <Button variant="outline" onClick={refreshStatus} disabled={connectLoading}>
                Refresh Status
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              We’ll add Stripe Connect onboarding next; for now, amounts shown are net of platform fees and follow the 5 business days schedule.
            </p>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
};

export default HostEarningsPage;
