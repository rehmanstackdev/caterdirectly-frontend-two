import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, DollarSign, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types/order-types';
import { useNavigate } from 'react-router-dom';
import { APP_LOGO } from '@/constants/app-assets';

interface DraftOrderCardProps {
  order: Order;
  onDelete?: (draftId: string) => void;
}

const DraftOrderCard = ({ order, onDelete }: DraftOrderCardProps) => {
  const navigate = useNavigate();

  const handleContinueEditing = () => {
    try {
      if (order?.id) localStorage.setItem('currentDraftId', order.id);
    } catch {}
    navigate(`/booking?draft=${order.id}`);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(order.id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Not set';
    }
  };

  const serviceCount = order.draftData?.service_count || 0;
  const lastModified = order.draftData?.updated_at 
    ? new Date(order.draftData.updated_at).toLocaleDateString()
    : 'Recently';

  const imageSrc = order.image || APP_LOGO.url;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden bg-background">
        <img
          src={imageSrc}
          alt={order.title}
          className="object-cover w-full h-full"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = APP_LOGO.url; }}
          loading="lazy"
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{order.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">Draft</Badge>
              <span className="text-sm text-muted-foreground">
                Last modified: {lastModified}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(order.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{order.location || 'Location not set'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{serviceCount} service{serviceCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>{formatCurrency(order.price || 0)} estimated</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleContinueEditing} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Continue Editing
          </Button>
          {onDelete && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DraftOrderCard;