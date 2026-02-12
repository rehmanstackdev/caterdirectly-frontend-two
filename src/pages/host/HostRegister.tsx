import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { EmailVerificationFeedback } from '@/components/auth/AuthFeedback';
import { Loader2 } from 'lucide-react';
import authService from '@/services/api/auth/auth.Service';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const HostRegister = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastEmail, setLastEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    if (!lastEmail) return;
    try {
      setIsResending(true);
      
      // TODO: Implement resend verification with backend API
      // For now, show a message to contact support
      toast.info('Resend verification', {
        description: 'Please contact support to resend verification email.',
      });
    } catch (err: any) {
      console.error('Resend verification error:', err);
      toast.error('Could not resend email', {
        description: 'Please try again in a few minutes.',
      });
    } finally {
      setIsResending(false);
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      formData.append('password', values.password);
      formData.append('role', 'host');
      
      const responseData = await authService.registerUser(formData);
      
      setLastEmail(values.email);
      setIsSuccess(true);

      toast.success("Registration Successful", {
        description: responseData.message || 'Please check your email to verify your account.',
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'An unexpected error occurred. Please try again.';
      toast.error("Registration Failed", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };
  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header hideNavigation={true} variant="light" />
        
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
              <CardDescription>
                We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailVerificationFeedback onResend={lastEmail && !isResending ? handleResendVerification : undefined} />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                onClick={() => navigate('/host/login')}
                className="w-full"
                variant="outline"
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header hideNavigation={true} variant="light" />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Event Host Account</CardTitle>
            <CardDescription className="text-center">
              Join thousands of hosts creating amazing events
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" type="email" {...field} />
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
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/host/login')} 
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default HostRegister;