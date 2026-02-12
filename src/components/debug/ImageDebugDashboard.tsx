import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useImageMonitoring } from '@/hooks/use-image-monitoring';
import { useImageErrorReporting } from '@/hooks/use-image-error-reporting';
import { getCacheStats } from '@/hooks/events/utils/image/cache';

/**
 * Debug dashboard for monitoring image system performance
 * Only shown in development or to admin users
 */
const ImageDebugDashboard = () => {
  const { getImageStats, getSlowImages, getFailedImages, clearMetrics } = useImageMonitoring();
  const { generateErrorReport, clearStoredErrors } = useImageErrorReporting();
  const [stats, setStats] = useState(getImageStats());
  const [cacheStats, setCacheStats] = useState(getCacheStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getImageStats());
      setCacheStats(getCacheStats());
    }, 5000);

    return () => clearInterval(interval);
  }, [getImageStats]);

  const slowImages = getSlowImages(2000);
  const failedImages = getFailedImages();
  const errorReport = generateErrorReport();

  const handleClearAll = () => {
    clearMetrics();
    clearStoredErrors();
    setStats(getImageStats());
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Image System Debug Dashboard</h2>
        <Button onClick={handleClearAll} variant="outline">
          Clear All Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImages}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageLoadTime.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cache Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.totalEntries}</div>
            <div className="text-xs text-muted-foreground">
              {cacheStats.successfulEntries} successful
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="slow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slow">Slow Images</TabsTrigger>
          <TabsTrigger value="failed">Failed Images</TabsTrigger>
          <TabsTrigger value="errors">Error Report</TabsTrigger>
          <TabsTrigger value="cache">Cache Details</TabsTrigger>
        </TabsList>

        <TabsContent value="slow">
          <Card>
            <CardHeader>
              <CardTitle>Images Loading Slowly (&gt;2s)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {slowImages.map((img, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1 truncate text-sm">{img.url}</div>
                    <Badge variant="secondary">{img.loadTime.toFixed(0)}ms</Badge>
                  </div>
                ))}
                {slowImages.length === 0 && (
                  <p className="text-muted-foreground">No slow images detected</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Image URLs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(failedImages).map(([url, count]) => (
                  <div key={url} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1 truncate text-sm">{url}</div>
                    <Badge variant="destructive">{count} failures</Badge>
                  </div>
                ))}
                {Object.keys(failedImages).length === 0 && (
                  <p className="text-muted-foreground">No failed images</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Errors by Type</h4>
                  <div className="space-y-1">
                    {errorReport.errorsByType.map(([type, count]) => (
                      <div key={type} className="flex justify-between text-sm">
                        <span>{type}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Most Problematic URLs</h4>
                  <div className="space-y-1">
                    {errorReport.errorsByUrl.map(([url, count]) => (
                      <div key={url} className="flex justify-between text-sm">
                        <span className="truncate flex-1">{url}</span>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache">
          <Card>
            <CardHeader>
              <CardTitle>Cache Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold">Total Entries</div>
                  <div>{cacheStats.totalEntries}</div>
                </div>
                <div>
                  <div className="font-semibold">Successful</div>
                  <div className="text-green-600">{cacheStats.successfulEntries}</div>
                </div>
                <div>
                  <div className="font-semibold">Failed</div>
                  <div className="text-red-600">{cacheStats.failedEntries}</div>
                </div>
                <div>
                  <div className="font-semibold">Expired</div>
                  <div className="text-yellow-600">{cacheStats.expiredEntries}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageDebugDashboard;