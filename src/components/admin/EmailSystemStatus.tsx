import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface EmailSystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  queue_stats: {
    queued_count: number;
    processing_count: number;
    sent_count: number;
    failed_count: number;
    oldest_queued: string | null;
  };
  monitoring_stats: {
    recent_batches: number;
    avg_processing_time_ms: number;
    total_processed_24h: number;
    total_failed_24h: number;
  };
  last_check: string;
}

const EmailSystemStatus = () => {
  const [health, setHealth] = useState<EmailSystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const checkEmailHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_email_system_health');
      
      if (error) throw error;
      
      setHealth(data as unknown as EmailSystemHealth);
    } catch (error) {
      console.error('Failed to check email system health:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEmailHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkEmailHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!health) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Checking email system...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={getStatusColor(health.status)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(health.status)}
            <CardTitle className="text-lg">Email System Status</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkEmailHealth}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription>
          Last checked: {new Date(health.last_check).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {health.status === 'critical' && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              Critical email system issues detected. Immediate attention required.
            </AlertDescription>
          </Alert>
        )}
        
        {health.status === 'warning' && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Email system showing warning signs. Monitor closely.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Queue Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Queued:</span>
                <span className="font-mono">{health.queue_stats.queued_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing:</span>
                <span className="font-mono">{health.queue_stats.processing_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Sent (24h):</span>
                <span className="font-mono text-green-600">{health.queue_stats.sent_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed (24h):</span>
                <span className="font-mono text-red-600">{health.queue_stats.failed_count}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Performance</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Batches (24h):</span>
                <span className="font-mono">{health.monitoring_stats.recent_batches}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Time:</span>
                <span className="font-mono">{Math.round(health.monitoring_stats.avg_processing_time_ms)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Processed:</span>
                <span className="font-mono">{health.monitoring_stats.total_processed_24h}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-mono">
                  {health.monitoring_stats.total_processed_24h > 0 
                    ? Math.round(((health.monitoring_stats.total_processed_24h - health.monitoring_stats.total_failed_24h) / health.monitoring_stats.total_processed_24h) * 100)
                    : 100}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSystemStatus;