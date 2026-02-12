import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/cater-directly/Header';
import Footer from '@/components/cater-directly/Footer';

const VendorResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const role = searchParams.get('role');
  console.log(role);
  console.log(token);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) {
      setError('No reset token found');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password
      });

      toast.success('Password updated successfully!');
      
      setTimeout(() => {
        navigate('/vendor/login');
      }, 1500);

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header hideNavigation={true} variant="light" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
              <CardDescription>No reset token found.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => navigate('/forgot-password')} className="w-full">
                Request New Reset Link
              </Button>
              <Button onClick={() => navigate('/vendor/login')} variant="outline" className="w-full">
                Back to Vendor Login
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
          <CardHeader className="text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-4" />
            <CardTitle>Reset Vendor Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
              
              <Button 
                type="button" 
                onClick={() => navigate('/vendor/login')} 
                variant="outline" 
                className="w-full"
              >
                Back to Vendor Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default VendorResetPasswordPage;