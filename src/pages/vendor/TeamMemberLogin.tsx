import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import authService from '@/services/api/auth/auth.Service';
import { Loader2, Users } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

function TeamMemberLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const responseData = await authService.teamMemberLogin({
        email: values.email.toLowerCase().trim(),
        password: values.password,
      });

      // Store auth data
      if (responseData.data?.token) {
        localStorage.setItem('auth_token', responseData.data.token);
      }
      if (responseData.data?.user) {
        // Enrich user_data with vendorId so vendor dashboard can resolve the correct vendor
        const userToStore = { ...responseData.data.user };
        if (responseData.data.vendorId) {
          userToStore.vendorId = responseData.data.vendorId;
        }
        localStorage.setItem('user_data', JSON.stringify(userToStore));
      }
      if (responseData.data?.role) {
        localStorage.setItem('user_role', responseData.data.role);
      }
      if (responseData.data?.teamRole) {
        localStorage.setItem('team_role', responseData.data.teamRole);
      }
      if (responseData.data?.vendorId) {
        sessionStorage.setItem('selected_vendor_id', responseData.data.vendorId);
      }

      localStorage.setItem('last_login_type', 'team_member');

      toast.success("Login Successful", {
        description: "Redirecting to your dashboard...",
      });

      window.dispatchEvent(new Event('auth-state-changed'));

      navigate('/vendor/dashboard');

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
            <div className="flex items-center justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-[#F07712]/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-[#F07712]" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Team Member Login</CardTitle>
            <CardDescription className="text-center">
              Sign in with the credentials provided by your vendor
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
                    className="w-full bg-[#F07712] hover:bg-[#F07712]/90"
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
            <div className="text-sm text-center text-gray-500 border-t pt-4">
              Own a vendor account?{' '}
              <Link
                to="/vendor/login"
                className="text-[#F07712] hover:underline font-medium"
              >
                Sign in as Vendor
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

export default TeamMemberLogin;
