import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import passwordResetService from '@/services/api/auth/passwordReset.service';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: EmailFormData) => {
    setIsLoading(true);

    try {
      await passwordResetService.requestPasswordReset({
        email: data.email,
        role: 'admin',
      });

      setEmailSent(true);
      toast.success('If an account exists with this email, you will receive a password reset link.');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to send password reset email. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header hideNavigation={true} variant="light" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We've sent a password reset link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-700">
                  Please check your email and click the reset link to create a new password.
                  The link will expire in 24 hours.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
                
                <Button 
                  onClick={() => navigate('/admin/login')}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header hideNavigation={true} variant="light" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/login')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl">Reset Admin Password</CardTitle>
            </div>
            <CardDescription>
              Enter your admin email address and we'll send you a link to reset your password.
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
                      <FormLabel>Admin Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="admin@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Email
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/admin/login')}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                Remember your password? Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminForgotPassword;