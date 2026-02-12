

import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';

interface LoginFooterProps {
  showAdminLogin?: boolean;
  showSuperAdminLogin?: boolean;
  forgotPasswordLink?: boolean;
}

export const LoginFooter = ({ 
  showAdminLogin = false, 
  showSuperAdminLogin = false,
  forgotPasswordLink = true,
}: LoginFooterProps) => {
  const navigate = useNavigate();
  
  return (
    <CardFooter className="flex flex-col space-y-4">
          {forgotPasswordLink && (  
        <div className="text-sm text-center text-gray-500">
          <Button 
            variant="link" 
            className="text-gray-500 hover:text-[#F07712] p-0"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot your password?
          </Button>
        </div>
      )}
      {showAdminLogin && (
        <div className="text-sm text-center text-gray-500">
          <Link 
            to="/admin/login" 
            className="text-[#F07712] hover:underline"
          >
            Go to admin login
          </Link>
        </div>
      )}
      
      {showSuperAdminLogin && (
        <div className="text-sm text-center text-gray-500">
          <Link 
            to="/super-admin/login" 
            className="text-[#F07712] hover:underline"
          >
            Go to super admin login
          </Link>
        </div>
      )}
      
      <div className="text-sm text-center text-gray-500">
        <Link 
          to="/vendor/login" 
          className="text-[#F07712] hover:underline"
        >
          Go to vendor login
        </Link>
      </div>
      
  

    </CardFooter>
  );
};
