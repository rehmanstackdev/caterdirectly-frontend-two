import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PendingServicesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ pathname: '/admin/services' }, { replace: true });
  }, [navigate]);

  return null;
}

export default PendingServicesPage;
