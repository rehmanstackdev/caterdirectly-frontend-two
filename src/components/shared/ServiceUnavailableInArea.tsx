
import React, { useState } from 'react';
import { MapPin, Clock, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { getDisplayCity } from '@/utils/address-utils';
import { useCreateWaitlistEntry } from '@/hooks/use-backend-waitlist';
import { toast } from 'sonner';

interface ServiceUnavailableInAreaProps {
  serviceType: string;
  address?: string;
}

const ServiceUnavailableInArea = ({ 
  serviceType,
  address 
}: ServiceUnavailableInAreaProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const createWaitlistEntry = useCreateWaitlistEntry();
  
  const handleFindMore = () => {
    navigate(`/marketplace?category=${serviceType}`);
  };

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await createWaitlistEntry.mutateAsync({
        email,
        // cardBetaType: `${serviceType}_unavailable_area`
      });
      
      setIsSubmitted(true);
      toast.success('Successfully joined the waitlist!');
    } catch (err: any) {
      console.error('Waitlist signup error:', err);
      if (err.message?.includes('already exists') || err.message?.includes('duplicate')) {
        toast.success("You're already on the list! We'll notify you when services are available.");
        setIsSubmitted(true);
      } else {
        toast.error(err?.message || 'Failed to join waitlist. Please try again.');
      }
    }
  };

  const formatServiceType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  if (isSubmitted) {
    return (
      <div className="w-full p-6 md:p-10 bg-green-50 rounded-lg border border-green-200 text-center">
        <div className="flex flex-col items-center max-w-lg mx-auto">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            You're on the list! 🎉
          </h3>
          
          <p className="text-gray-600 mb-4">
            We'll notify you as soon as {formatServiceType(serviceType).toLowerCase()} services become available in your area.
          </p>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-[#F07712] hover:bg-[#F07712]/90"
          >
            Continue Exploring
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center">
      <div className="flex flex-col items-center max-w-lg mx-auto">
        <div className="bg-blue-100 p-3 rounded-full mb-4">
          <Clock className="h-6 w-6 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {formatServiceType(serviceType)} services coming soon in your area!
        </h3>
        
        {address && (
          <div className="flex items-center mt-2 mb-4 text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{getDisplayCity(address)}</span>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          We're expanding to bring amazing {formatServiceType(serviceType).toLowerCase()} services to your area. 
          Be the first to know when they arrive!
        </p>

        {/* Waitlist Signup Form */}
        <form onSubmit={handleWaitlistSignup} className="w-full max-w-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                disabled={createWaitlistEntry.isPending}
              />
            </div>
            <Button 
              type="submit"
              disabled={createWaitlistEntry.isPending || !email}
              className="bg-[#F07712] hover:bg-[#F07712]/90 whitespace-nowrap"
            >
              <Mail className="h-4 w-4 mr-2" />
              {createWaitlistEntry.isPending ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </div>
        </form>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleFindMore}
            variant="outline"
            className="border-blue-300 hover:bg-blue-50"
          >
            Explore Nearby Services
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-blue-300 hover:bg-blue-50"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnavailableInArea;
