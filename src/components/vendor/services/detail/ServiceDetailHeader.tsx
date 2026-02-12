
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceDetailHeaderProps {
  handleDelete: () => void;
  serviceId?: string;
}

const ServiceDetailHeader: React.FC<ServiceDetailHeaderProps> = ({ 
  handleDelete,
  serviceId
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/vendor/services');
  };

  const handleEdit = () => {
    navigate(`/vendor/services/edit/${serviceId}`);
  };

  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" onClick={handleBack} className="gap-1">
        <ArrowLeft className="h-4 w-4" />
        Back to Services
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>
    </div>
  );
};

export default ServiceDetailHeader;
