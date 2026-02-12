
import { useState, useEffect } from 'react';
import { Profile } from '@/types/profile';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { mapUserType } from './utils';

export const useProfileFetch = () => {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!user) {
          setProfileData(null);
          setIsLoading(false);
          return;
        }

        // Use data from localStorage instead of Supabase
        const storedUserData = localStorage.getItem('user_data');
        let userData = null;
        if (storedUserData) {
          userData = JSON.parse(storedUserData);
        }

        const personal = {
          firstName: userData?.firstName || user.firstName || '',
          lastName: userData?.lastName || user.lastName || '',
          email: userData?.email || user.email || '',
          phone: userData?.phone || '',
          jobTitle: userData?.jobTitle || '',
          userType: mapUserType(userData?.userType ?? null),
          profileImage: userData?.imageUrl || '',
          location: userData?.location || '',
          locationData: userData?.locationCity || userData?.locationLat ? {
            city: userData?.locationCity || '',
            state: userData?.locationState || '',
            street: userData?.locationStreet || '',
            zipCode: userData?.locationZipCode || '',
            lat: userData?.locationLat ? Number(userData.locationLat) : undefined,
            lng: userData?.locationLng ? Number(userData.locationLng) : undefined,
          } : undefined
        } as Profile['personal'];

        const company = {
          companyName: userData?.vendor?.businessName || '',
          industry: '',
          companySize: '1-10' as any,
          website: userData?.vendor?.website || '',
          address: userData?.vendor?.address || '',
          city: userData?.vendor?.city || '',
          state: userData?.vendor?.state || '',
          zipCode: userData?.vendor?.zipCode || '',
          country: 'United States',
          description: '',
          logo: '',
          taxId: userData?.vendor?.einTin || ''
        } as Profile['company'];

        const notifications = {
          orderUpdates: true,
          vendorMessages: true,
          promotions: false,
          reminders: true,
          newsletter: false,
          productUpdates: true,
          eventRecaps: true,
          accountAlerts: true
        } as Profile['notifications'];

        const paymentMethods: Profile['paymentMethods'] = {
          creditCards: [],
          bankAccounts: [],
          achAccounts: [],
          hasNetTerms: false,
          netTermsStatus: 'not_applied',
          defaultMethod: 'card'
        };

        setProfileData({ personal, company, paymentMethods, notifications });
      } catch (err) {
        console.error('Error in useProfile hook:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
        setError(errorMessage);
        toast({ title: 'Profile Error', description: errorMessage, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    profileData,
    isLoading,
    error,
    setProfileData
  };
};
