import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Mail, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Dashboard from '@/components/dashboard/Dashboard';
import EmailSystemStatus from '@/components/admin/EmailSystemStatus';

interface EmailStats {
  total_sent_24h: number;
  total_failed_24h: number;
  total_queued: number;
  total_processing: number;
  success_rate: number;
  avg_processing_time: number;
}

interface TemplatePerformance {
  template_name: string;
  sent_count: number;
  failed_count: number;
  success_rate: number;
}

interface RecentFailure {
  id: string;
  recipient_email: string;
  subject: string;
  error_message: string;
  created_at: string;
  attempts: number;
}

const EmailAnalytics = () => {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [templatePerformance, setTemplatePerformance] = useState<TemplatePerformance[]>([]);
  const [recentFailures, setRecentFailures] = useState<RecentFailure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch basic stats
      const { data: queueData } = await supabase
        .from('email_queue')
        .select('status, created_at, attempts')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: logsData } = await supabase
        .from('email_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: monitoringData } = await supabase
        .from('email_monitoring')
        .select('processing_time_ms')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Calculate stats
      const sentCount = queueData?.filter(e => e.status === 'sent').length || 0;
      const failedCount = queueData?.filter(e => e.status === 'failed').length || 0;
      const queuedCount = queueData?.filter(e => e.status === 'queued').length || 0;
      const processingCount = queueData?.filter(e => e.status === 'processing').length || 0;
      const avgTime = monitoringData?.length 
        ? Math.round(monitoringData.reduce((sum, m) => sum + (m.processing_time_ms || 0), 0) / monitoringData.length)
        : 0;

      setStats({
        total_sent_24h: sentCount,
        total_failed_24h: failedCount,
        total_queued: queuedCount,
        total_processing: processingCount,
        success_rate: sentCount + failedCount > 0 ? (sentCount / (sentCount + failedCount)) * 100 : 100,
        avg_processing_time: avgTime
      });

      // Fetch template performance
      const { data: templatesData } = await supabase
        .from('email_queue')
        .select('template_name, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (templatesData) {
        const perfMap = new Map<string, { sent: number; failed: number }>();
        templatesData.forEach(email => {
          const current = perfMap.get(email.template_name) || { sent: 0, failed: 0 };
          if (email.status === 'sent') current.sent++;
          if (email.status === 'failed') current.failed++;
          perfMap.set(email.template_name, current);
        });

        const performance = Array.from(perfMap.entries()).map(([name, counts]) => ({
          template_name: name,
          sent_count: counts.sent,
          failed_count: counts.failed,
          success_rate: counts.sent + counts.failed > 0 
            ? (counts.sent / (counts.sent + counts.failed)) * 100 
            : 100
        })).sort((a, b) => (b.sent_count + b.failed_count) - (a.sent_count + a.failed_count));

        setTemplatePerformance(performance);
      }

      // Fetch recent failures
      const { data: failuresData } = await supabase
        .from('email_queue')
        .select('id, recipient_email, template_name as subject, error_message, created_at, attempts')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (failuresData) {
        setRecentFailures(failuresData as any);
      }

    } catch (error) {
      console.error('Failed to fetch email analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['hsl(var(--brand))', 'hsl(var(--finance-positive))', 'hsl(var(--destructive))'];

  return (
    <Dashboard userRole="admin" activeTab="settings">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand to-brand/60 bg-clip-text text-transparent">
              Email Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Monitor email performance and deliverability</p>
          </div>
          <Button
            onClick={fetchAnalytics}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Email System Status */}
        <EmailSystemStatus />

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent (24h)</CardTitle>
              <Mail className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_sent_24h || 0}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.success_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.avg_processing_time || 0}ms</div>
              <p className="text-xs text-muted-foreground">Per email</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_queued || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_processing || 0} processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Template Performance */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Template Performance (7 days)</CardTitle>
            <CardDescription>Email template success rates and volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templatePerformance.map((template, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <h4 className="font-medium">{template.template_name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-success" />
                        {template.sent_count} sent
                      </span>
                      {template.failed_count > 0 && (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-destructive" />
                          {template.failed_count} failed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {template.success_rate.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">success rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Failures */}
        {recentFailures.length > 0 && (
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                Recent Failures
              </CardTitle>
              <CardDescription>Last 10 failed email attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentFailures.map((failure) => (
                  <div key={failure.id} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{failure.recipient_email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Template: {failure.subject}
                        </p>
                        <p className="text-xs text-destructive mt-2">
                          {failure.error_message}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{new Date(failure.created_at).toLocaleDateString()}</div>
                        <div className="mt-1">Attempts: {failure.attempts}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Dashboard>
  );
};

export default EmailAnalytics;
