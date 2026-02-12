
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  path: string;
  variant?: 'default' | 'outline';
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  path,
  variant = 'outline',
  className = '',
}) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant={variant}
      className={className}
      onClick={() => navigate(path)}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default ActionButton;
