import { GlassCard } from '@/components/glass-ui/GlassCard';
import { GlassButton } from '@/components/glass-ui/GlassButton';
import { 
  Plus,
  FileText,
  Building2,
  Settings,
  Users,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminQuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Create Invoice',
      description: 'Start a new invoice for a client',
      icon: Plus,
      onClick: () => navigate('/marketplace?mode=invoice'),
      variant: 'default' as const,
      primary: true
    },
    {
      title: 'Order Management',
      description: 'View and manage all orders',
      icon: ShoppingBag,
      onClick: () => navigate('/admin/orders'),
      variant: 'outline' as const
    },
    {
      title: 'Vendor Management',
      description: 'Manage vendor accounts and applications',
      icon: Building2,
      onClick: () => navigate('/admin/vendors'),
      variant: 'outline' as const
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: Users,
      onClick: () => navigate('/admin/users'),
      variant: 'outline' as const
    },
    {
      title: 'Service Management',
      description: 'Approve and manage services',
      icon: Settings,
      onClick: () => navigate('/admin/services'),
      variant: 'outline' as const
    },
    {
      title: 'View Invoices',
      description: 'Manage existing invoices',
      icon: FileText,
      onClick: () => navigate('/admin/invoices'),
      variant: 'outline' as const
    }
  ];

  return (
    <GlassCard variant="elevated" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <GlassButton
            key={action.title}
            variant={action.primary ? 'primary' : 'secondary'}
            size="lg"
            onClick={action.onClick}
            className="h-auto p-4 justify-start text-left w-full"
          >
            <div className="flex items-start gap-3 w-full min-w-0">
              <action.icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-medium text-sm leading-tight">{action.title}</div>
                <div className="text-xs opacity-80 leading-tight">{action.description}</div>
              </div>
            </div>
          </GlassButton>
        ))}
      </div>
    </GlassCard>
  );
};

export default AdminQuickActions;