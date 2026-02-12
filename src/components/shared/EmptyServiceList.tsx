
import React, { useState } from 'react';
import { Sparkles, Clock, MapPin, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface EmptyServiceListProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  type?: 'catering' | 'venue' | 'party-rental' | 'staff';
  showLocationSetter?: boolean;
  showWaitlist?: boolean;
}

const EmptyServiceList = ({
  title,
  description,
  showCreateButton = false,
  type = 'catering',
  showLocationSetter = true,
  showWaitlist = true
}: EmptyServiceListProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateService = () => {
    // Redirect to vendor login instead of service creation page
    navigate('/vendor/login');
  };

  const handleSetLocation = () => {
    // Navigate to location setting or trigger location modal
    navigate('/', { state: { showLocationModal: true } });
  };

  const handleWaitlistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // TODO: Store waitlist signup in database
    // For now, simulate the submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
      console.log('Waitlist signup:', { email, serviceType: type });
    }, 1000);
  };

  const getServiceSpecificContent = () => {
    switch (type) {
      case 'catering':
        return {
          title: title || 'Amazing Caterers Coming Soon!',
          description: description || 'We\'re working with incredible caterers to bring you the most delicious options. Get ready for an amazing culinary experience!',
          buttonText: 'Be the First to Cater!',
          serviceLabel: 'catering'
        };
      case 'venue':
        return {
          title: title || 'Stunning Venues Coming Your Way!',
          description: description || 'Beautiful venues are joining our platform soon. From elegant ballrooms to charming outdoor spaces - exciting options await!',
          buttonText: 'List Your Venue First!',
          serviceLabel: 'venue'
        };
      case 'party-rental':
        return {
          title: title || 'Exciting Party Rentals Arriving Soon!',
          description: description || 'Get ready for the most amazing party rental options! From elegant decor to fun entertainment - we\'re bringing you everything to make your event unforgettable.',
          buttonText: 'Join as a Rental Provider!',
          serviceLabel: 'party rental'
        };
      case 'staff':
        return {
          title: title || 'Professional Staff Services Launching Soon!',
          description: description || 'Top-tier event professionals are joining our platform. From bartenders to servers to event coordinators - exceptional service is coming your way!',
          buttonText: 'Offer Your Services!',
          serviceLabel: 'staffing'
        };
      default:
        return {
          title: title || 'Something Amazing is Coming Soon!',
          description: description || 'We\'re working hard to bring you incredible options. Stay tuned for exciting updates!',
          buttonText: 'Join the Movement!',
          serviceLabel: 'service'
        };
    }
  };

  const content = getServiceSpecificContent();

  if (isSubmitted) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 mb-6 inline-block shadow-lg">
            <CheckCircle className="h-12 w-12 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            You're on the list! 🎉
          </h3>
          
          <p className="text-gray-700 text-center leading-relaxed mb-8 text-lg">
            We'll notify you as soon as {content.serviceLabel} services become available.
          </p>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#F07712] to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-semibold rounded-full shadow-lg"
          >
            Continue Exploring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-4 right-4 opacity-10">
        <Sparkles className="h-20 w-20 text-[#F07712]" />
      </div>
      <div className="absolute bottom-4 left-4 opacity-10">
        <Sparkles className="h-16 w-16 text-[#F07712]" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        <div className="bg-gradient-to-r from-[#F07712] to-orange-400 rounded-full p-4 mb-6 inline-block shadow-lg">
          <Clock className="h-12 w-12 text-white animate-pulse" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#F07712] to-orange-600 bg-clip-text text-transparent">
          {content.title}
        </h3>
        
        <p className="text-gray-700 text-center leading-relaxed mb-8 text-lg">
          {content.description}
        </p>

        <div className="space-y-4 mb-8">
          {/* Location Setting Option */}
          {showLocationSetter && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-gray-600 mb-3">
                💡 Set your location to see what's available in your area
              </p>
              <Button 
                onClick={handleSetLocation}
                variant="outline"
                className="w-full border-orange-300 hover:bg-orange-50 text-orange-700"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Set Your Location
              </Button>
            </div>
          )}

          {/* Waitlist Signup */}
          {showWaitlist && (
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-gray-600 mb-3">
                🔔 Get notified when {content.serviceLabel} services launch
              </p>
              <form onSubmit={handleWaitlistSignup} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
                <Button 
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="w-full bg-gradient-to-r from-[#F07712] to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </Button>
              </form>
            </div>
          )}
        </div>
        
        {/* Vendor CTA - Only show if explicitly requested */}
        {showCreateButton && (
          <div className="border-t border-orange-200 pt-6">
            <p className="text-xs text-gray-500 mb-3">
              Are you a service provider?
            </p>
            <Button 
              onClick={handleCreateService} 
              variant="outline"
              className="border-orange-300 hover:bg-orange-50 text-orange-700"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {content.buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyServiceList;
