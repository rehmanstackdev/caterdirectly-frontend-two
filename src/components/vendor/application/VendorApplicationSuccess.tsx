
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Clock, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const VendorApplicationSuccess: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-3xl font-bold text-green-800">Application Submitted!</CardTitle>
        <CardDescription className="text-lg">
          Thank you for applying to join our vendor marketplace. Your application is now under review.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Email Confirmation:</strong> We've sent a confirmation email to your registered address with your application details.
          </AlertDescription>
        </Alert>

        <Alert className="bg-yellow-50 border-yellow-200">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Review Process:</strong> Our team will review your application within 2-3 business days. You'll receive an email notification once approved.
          </AlertDescription>
        </Alert>

        <Alert className="bg-purple-50 border-purple-200">
          <Shield className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800">
            <strong>Next Steps:</strong> Once approved, you'll receive login credentials and access to your vendor dashboard to start managing your services.
          </AlertDescription>
        </Alert>

        <div className="text-center text-sm text-muted-foreground">
          Questions? Contact our vendor support team at <strong>support@caterdirectly.com</strong>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate('/vendor/login')}
          className="flex-1 border border-gray-300"
        >
          Go to Vendor Login
        </Button>
        <Button 
          onClick={() => navigate('/')}
          className="flex-1 bg-[#F07712] hover:bg-[#E06600]"
        >
          Back to Homepage
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VendorApplicationSuccess;
