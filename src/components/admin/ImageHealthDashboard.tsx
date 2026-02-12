import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useImageMonitoring } from '@/hooks/useImageMonitoring';

const ImageHealthDashboard = () => {
  const { getMetrics, getHealthReport, clearMetrics } = useImageMonitoring();
  const [healthData, setHealthData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const updateHealth = () => {
      const report = getHealthReport();
      setHealthData(report);
    };

    updateHealth();
    const interval = setInterval(updateHealth, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [refreshKey, getHealthReport]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleClear = () => {
    clearMetrics();
    setRefreshKey(prev => prev + 1);
  };

  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Image System Health</CardTitle>
          <CardDescription>Loading health metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted/20 animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Image System Health</h2>
          <p className="text-muted-foreground">Monitor image loading performance across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear Data
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Status
            <Badge className={`${getStatusColor(healthData.status)} text-white`}>
              {healthData.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{healthData.recentSuccessRate}%</div>
              <div className="text-sm text-muted-foreground">Recent Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthData.totalLoads}</div>
              <div className="text-sm text-muted-foreground">Total Loads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthData.averageLoadTime}ms</div>
              <div className="text-sm text-muted-foreground">Average Load Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthData.failedLoads}</div>
              <div className="text-sm text-muted-foreground">Failed Loads</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Analysis */}
      {Object.keys(healthData.errorReasons).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
            <CardDescription>Common image loading failures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(healthData.errorReasons).map(([reason, count]: [string, any]) => (
                <div key={reason} className="flex justify-between items-center">
                  <span className="text-sm">{reason}</span>
                  <Badge variant="secondary">{count} errors</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {healthData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested improvements for image performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {healthData.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">⚠️</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Metrics</CardTitle>
          <CardDescription>Detailed performance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Total Image Loads:</strong> {healthData.totalLoads}
            </div>
            <div>
              <strong>Successful Loads:</strong> {healthData.successfulLoads}
            </div>
            <div>
              <strong>Failed Loads:</strong> {healthData.failedLoads}
            </div>
            <div>
              <strong>Overall Success Rate:</strong> {healthData.successRate}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageHealthDashboard;