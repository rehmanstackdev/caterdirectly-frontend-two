

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyEventState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 mb-2">You don't have any upcoming events scheduled.</p>
      <Button 
        onClick={() => navigate('/events/create')}
        className="mt-2"
      >
        Create New Event
      </Button>
    </div>
  );
};

export default EmptyEventState;
