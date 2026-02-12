import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Clock, DollarSign, Calendar } from 'lucide-react';

interface ProposalRevisionHistoryProps {
  proposalId: string;
  currentProposal: any;
}

const ProposalRevisionHistory = ({
  proposalId,
  currentProposal
}: ProposalRevisionHistoryProps) => {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevisions();
  }, [proposalId]);

  const loadRevisions = async () => {
    try {
      const { data, error } = await supabase
        .from('invoice_revisions')
        .select('*')
        .eq('invoice_id', proposalId)
        .order('revision_number', { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (error) {
      console.error('Error loading revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareWithPrevious = (current: any, previous: any) => {
    const changes: string[] = [];

    if (current.total !== previous.total) {
      changes.push(`Total changed from $${previous.total?.toFixed(2)} to $${current.total?.toFixed(2)}`);
    }

    if (current.service_date !== previous.service_date) {
      const prevDate = previous.service_date ? new Date(previous.service_date).toLocaleDateString() : 'Not set';
      const currDate = current.service_date ? new Date(current.service_date).toLocaleDateString() : 'Not set';
      changes.push(`Service date changed from ${prevDate} to ${currDate}`);
    }

    if (current.service_time !== previous.service_time) {
      changes.push(`Service time changed from "${previous.service_time || 'Not set'}" to "${current.service_time || 'Not set'}"`);
    }

    // Compare items (simplified)
    const currentItems = Array.isArray(current.items) ? current.items : [];
    const previousItems = Array.isArray(previous.items) ? previous.items : [];
    
    if (currentItems.length !== previousItems.length) {
      changes.push(`Number of items changed from ${previousItems.length} to ${currentItems.length}`);
    }

    return changes;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (revisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Revision History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No revisions have been made to this proposal yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Revision History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current version */}
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">Current Version</Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(currentProposal.updated_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold">${currentProposal.total?.toFixed(2)}</span>
            </div>
          </div>
          {revisions.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-1">Changes from previous version:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {compareWithPrevious(currentProposal, revisions[0]).map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Previous revisions */}
        {revisions.map((revision, index) => {
          const nextRevision = revisions[index + 1];
          const changes = nextRevision ? compareWithPrevious(revision, nextRevision) : [];

          return (
            <div key={revision.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Version {revision.revision_number}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(revision.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-semibold">${revision.total?.toFixed(2)}</span>
                </div>
              </div>
              
              {revision.changes_summary && (
                <p className="text-sm text-muted-foreground mb-2">{revision.changes_summary}</p>
              )}
              
              {changes.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Changes from previous version:</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {changes.map((change, changeIndex) => (
                      <li key={changeIndex}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProposalRevisionHistory;