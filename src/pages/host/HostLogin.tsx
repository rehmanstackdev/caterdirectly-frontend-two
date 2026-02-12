import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import authService from '@/services/api/auth/auth.Service';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const HostLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const responseData = await authService.loginUser({
        email: values.email.toLowerCase().trim(),
        password: values.password,
        role: 'host',
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
      localStorage.setItem('last_login_type', 'host');
      
      toast.success("Login Successful", {
        description: "Welcome back! Redirecting to dashboard...",
      });
      
      // Dispatch auth state change event to notify AuthProvider
      window.dispatchEvent(new Event('auth-state-changed'));
      
      // Redirect to host dashboard
      navigate("/host/dashboard");
      
    } catch (error: any) {
      console.error('Login error:', error);
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
            <CardTitle className="text-2xl font-bold text-center">Event Host Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your event dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#7c3aed] hover:bg-[#6d28d9]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Don't have an account yet?{' '}
              <button 
                onClick={() => navigate('/host/register')} 
                className="text-[#9b87f5] hover:underline"
              >
                Register as an event host
              </button>
            </div>
            
            <div className="text-sm text-center text-gray-500">
              <button 
                className="text-gray-500 hover:text-[#9b87f5]"
                onClick={() => navigate('/host/forgot-password')}
              >
                Forgot your password?
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default HostLogin;
