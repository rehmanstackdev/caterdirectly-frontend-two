
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import { useAuth } from '@/contexts/auth';
import { AdminLoginForm, AdminFormValues } from '@/components/admin/auth/AdminLoginForm';
import authService from '@/services/api/auth/auth.Service';
import { LoginFooter } from '@/components/admin/auth/LoginFooter';

function SuperAdminLogin() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Redirect after auth state updates
  useEffect(() => {
    if (shouldRedirect && user && userRole) {
      console.log("Auth state updated, redirecting now", { user: !!user, userRole });
      
      let redirectPath = '/admin/dashboard';
      
      switch (userRole) {
        case 'admin':
        case 'super_admin':
        case 'super-admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'vendor':
          redirectPath = '/vendor/dashboard';
          break;
        case 'event-host':
          redirectPath = '/host/dashboard';
          break;
        default:
          console.warn("Unknown role, defaulting to admin dashboard");
          redirectPath = '/admin/dashboard';
      }
      
      console.log("Navigating to:", redirectPath);
      navigate(redirectPath, { replace: true });
      setShouldRedirect(false);
    }
  }, [shouldRedirect, user, userRole, navigate]);
  
  // Check if user wants to force logout (for testing)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      console.log("Force logout requested");
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_role');
      window.location.href = '/super-admin/login';
    }
  }, []);

  const handleSubmit = async (values: AdminFormValues) => {
    setIsLoading(true);
    
    try {
      const responseData = await authService.loginUser({
        email: values.email.toLowerCase().trim(),
        password: values.password,
        role: 'super_admin',
      });
      
      // Store auth data
      if (responseData.data?.token) {
        localStorage.setItem('auth_token', responseData.data.token);
      }
      if (responseData.data?.user) {
        localStorage.setItem('user_data', JSON.stringify(responseData.data.user));
      }
      if (responseData.data?.role) {
        localStorage.setItem('user_role', responseData.data.role);
      } else if (responseData.data?.user?.roles && responseData.data.user.roles.length > 0) {
        const role = responseData.data.user.roles[0].role;
        localStorage.setItem('user_role', role);
      }
      
      // Store login type for password reset detection
      localStorage.setItem('last_login_type', 'super-admin');
      
      console.log("SuperAdminLogin: Login successful");
      
      // Dispatch auth state change event to notify AuthProvider
      window.dispatchEvent(new Event('auth-state-changed'));
      
      toast.success("Login Successful", {
        description: "Redirecting to dashboard...",
      });
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "An unexpected error occurred. Please try again.";
      toast.error("Login Failed", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header hideNavigation={true} variant="light" />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Super Admin Login</CardTitle>
            </div>
            <CardDescription className="text-left">
              Enter your credentials to access the super admin dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <AdminLoginForm 
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </CardContent>
          
          <LoginFooter showAdminLogin={true} showSuperAdminLogin={false} forgotPasswordLink={false} />
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}

export default SuperAdminLogin;

