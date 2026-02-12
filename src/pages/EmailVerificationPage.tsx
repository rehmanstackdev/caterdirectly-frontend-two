import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';
import authService from '@/services/api/auth/auth.Service';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Check for role parameter in URL or localStorage
  const roleParam = searchParams.get('role');
  const storedRole = localStorage.getItem('pending_verification_role');

  const verifyEmail = async (verificationToken: string) => {
    try {
      const responseData = await authService.verifyEmail(verificationToken);

      setStatus('success');
      setMessage(responseData.message || 'Email verified successfully!');
      
      // Extract user role from API response - check multiple possible locations
      const role = responseData.data?.user?.role || 
                   responseData.data?.role || 
                   responseData.user?.role || 
                   responseData.role;
      
      if (role) {
        setUserRole(role);
      }
      
      toast.success('Email verified successfully!');
    } catch (error: any) {
      console.error('Email verification error:', error);
      setStatus('error');
      const errorMsg = error?.response?.data?.message || error?.message || 'Email verification failed.';
      setMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    verifyEmail(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleContinue = () => {


    
    if (roleParam === 'host') {
      navigate('/host/login');
    } else if (roleParam === 'vendor') {
      navigate('/vendor/login');
    } else {
      navigate('/vendor/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header hideNavigation={true} variant="light" />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full">
              {status === 'loading' && (
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-12 w-12 text-green-600" />
              )}
              {status === 'error' && (
                <XCircle className="h-12 w-12 text-red-600" />
              )}
            </div>
            
            <CardTitle>
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            
            <CardDescription>
              {message}
            </CardDescription>
          </CardHeader>
          
          {status !== 'loading' && (
            <CardContent className="space-y-4">
              <Button 
                onClick={handleContinue}
                className="w-full"
              >
                {status === 'success' ? 'Continue to Login' : 'Go to Login'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Return to Home
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default EmailVerificationPage;