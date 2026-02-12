import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';

const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const SetupPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [vendorInfo, setVendorInfo] = useState<any>(null);

  const token = searchParams.get('token');

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidatingToken(false);
        return;
      }

      try {
        // Validate the password reset token
        const { data, error } = await supabase
          .from('password_reset_tokens')
          .select('user_id, expires_at, used')
          .eq('token', token)
          .eq('used', false)
          .single();

        if (error || !data) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Token validation error:', error);
          }
          setTokenValid(false);
          setIsValidatingToken(false);
          return;
        }

        // Check if token is expired
        if (new Date(data.expires_at) < new Date()) {
          setTokenValid(false);
          setIsValidatingToken(false);
          toast({
            title: 'Token Expired',
            description: 'This password setup link has expired. Please contact support.',
            variant: 'destructive',
          });
          return;
        }

        // Get vendor information
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .select('company_name, email')
          .eq('user_id', data.user_id)
          .single();

        if (vendorError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Vendor lookup error:', vendorError);
          }
          setTokenValid(false);
          setIsValidatingToken(false);
          return;
        }

        setVendorInfo(vendor);
        setTokenValid(true);
        setIsValidatingToken(false);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Token validation failed:', error);
        }
        setTokenValid(false);
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token, toast]);

  const onSubmit = async (data: PasswordFormData) => {
    if (!token) return;

    setIsLoading(true);

    try {
      // Get token info again to ensure it's still valid
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('user_id')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        throw new Error('Invalid or expired token');
      }

      // Update the user's password using the admin API
      const { error: passwordError } = await supabase.rpc('set_user_password', {
        user_id_param: tokenData.user_id,
        new_password: data.password
      });

      if (passwordError) {
        throw new Error('Failed to update password');
      }

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token);

      toast({
        title: 'Password Set Successfully',
        description: 'Your password has been set. You can now log in to your vendor dashboard.',
      });

      // Redirect to vendor login
      setTimeout(() => {
        navigate('/vendor/login');
      }, 2000);

    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Password setup error:', error);
      }
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to set up password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header variant="light" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Validating setup link...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header hideNavigation={true} variant="light" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Invalid Setup Link</CardTitle>
              <CardDescription className="text-center">
                This password setup link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/vendor/login')} 
                className="w-full"
                variant="outline"
              >
                Go to Login
              </Button>
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
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Welcome to Cater Directly!</CardTitle>
            <CardDescription>
              Complete your vendor account setup for {vendorInfo?.company_name}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                Your vendor application has been approved! Please set up your password to access your dashboard.
              </AlertDescription>
            </Alert>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password"
                          {...field}
                        />
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
                        <Input 
                          type="password" 
                          placeholder="Confirm your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set Up Password
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>Email: {vendorInfo?.email}</p>
              <p>Company: {vendorInfo?.company_name}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default SetupPasswordPage;