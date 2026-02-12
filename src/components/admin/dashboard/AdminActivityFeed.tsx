import { GlassCard } from '@/components/glass-ui/GlassCard';
import { GlassBadge } from '@/components/glass-ui/GlassBadge';
import { 
  Activity,
  Building2,
  ShoppingBag,
  Settings,
  AlertTriangle,
  User,
  Clock
} from 'lucide-react';
import { useRecentActivities } from '@/hooks/use-admin-dashboard';

const AdminActivityFeed = () => {
  const { data: activities, isLoading } = useRecentActivities();

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'new vendor':
        return Building2;
      case 'new booking':
        return ShoppingBag;
      case 'service update':
        return Settings;
      case 'support ticket':
        return AlertTriangle;
      default:
        return User;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_approval':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'requires_attention':
        return 'bg-orange-100 text-orange-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <GlassCard variant="elevated" className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-white/20 rounded-xl animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  const getVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status.toLowerCase()) {
      case 'pending_approval':
      case 'pending':
        return 'warning';
      case 'approved':
      case 'completed':
      case 'active':
        return 'success';
      case 'rejected':
      case 'cancelled':
      case 'canceled':
        return 'danger';
      case 'requires_attention':
        return 'warning';
      case 'open':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-brand" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {activities && activities.length > 0 ? (
          activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                <div className="p-2 bg-white/20 rounded-full flex-shrink-0">
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{activity.type}</span>
                    <GlassBadge variant={getVariant(activity.status)} size="sm">
                      {formatStatus(activity.status)}
                    </GlassBadge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {activity.name}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.date}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm">No recent activity found</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default AdminActivityFeed;