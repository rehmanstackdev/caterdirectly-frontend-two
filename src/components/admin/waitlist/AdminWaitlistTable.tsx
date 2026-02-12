import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail,
  Calendar,
  Clock,
  Search,
  Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useBackendWaitlist, useDeleteWaitlistEntry } from '@/hooks/use-backend-waitlist';

interface WaitlistEntry {
  id: string;
  email: string;
  reason?: string;
  source?: string;
  created_at: string;
}

const AdminWaitlistTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: entries = [], isLoading: loading } = useBackendWaitlist();
  const deleteEntry = useDeleteWaitlistEntry();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getSourceBadgeColor = (source?: string) => {
    switch (source?.toLowerCase()) {
      case 'landing_page':
        return 'bg-blue-100 text-blue-800';
      case 'marketplace':
        return 'bg-green-100 text-green-800';
      case 'referral':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEntries = entries.filter(entry =>
    entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Beta Waitlist Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 sm:h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
          Beta Waitlist Entries ({entries.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {filteredEntries.map((entry) => (
            <div 
              key={entry.id} 
              className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <h4 className="font-semibold text-sm leading-tight truncate">{entry.email}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.source && (
                        <Badge className={`${getSourceBadgeColor(entry.source)} text-xs`}>
                          {entry.source}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {entry.reason && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Reason:</span> {entry.reason}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(entry.created_at)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`mailto:${entry.email}`, '_blank')}
                    className="text-xs"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteEntry.mutate(entry.id)}
                    disabled={deleteEntry.isPending}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredEntries.length === 0 && !loading && (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Mail className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-2 sm:mb-4" />
              <p className="text-sm sm:text-base">
                {searchTerm ? 'No entries match your search' : 'No waitlist entries found'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminWaitlistTable;