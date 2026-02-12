import { useAuth } from '@/contexts/auth';
import { mapUserType } from './utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usersService } from '@/services/users.service';

export const useProfileUpdate = (setProfileData: any) => {
  const { user } = useAuth();

  const updateProfile = async (section: string, data: any) => {
    if (!user) {
      toast.error("Authentication Required", { description: "You must be logged in to update your profile" });
      return Promise.reject("No user logged in");
    }
    
    try {
      // Optimistically update UI first
      setProfileData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: {
            ...prev[section],
            ...data
          }
        };
      });

      // Persist updates to backend API per section
      if (section === 'personal') {
        try {
          // Call backend API to update personal info
          const updatedUser = await usersService.updatePersonalInfo(user.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            location: data.location,
            locationData: data.locationData,
          });

          // Update local state with response
          setProfileData((prev: any) => ({
            ...prev,
            personal: {
              firstName: updatedUser?.firstName || data.firstName || '',
              lastName: updatedUser?.lastName || data.lastName || '',
              email: updatedUser?.email || data.email || user.email || '',
              phone: updatedUser?.phone || data.phone || '',
              profileImage: updatedUser?.imageUrl || prev?.personal?.profileImage || '',
              location: updatedUser?.location || data.location || '',
              locationData: data.locationData || {
                city: updatedUser?.locationCity,
                state: updatedUser?.locationState,
                street: updatedUser?.locationStreet,
                zipCode: updatedUser?.locationZipCode,
                lat: updatedUser?.locationLat,
                lng: updatedUser?.locationLng,
              }
            }
          }));

          // Also update localStorage so location data persists across page navigations
          try {
            const storedUserData = localStorage.getItem('user_data');
            const userData = storedUserData ? JSON.parse(storedUserData) : {};
            const updatedUserData = {
              ...userData,
              firstName: updatedUser?.firstName || data.firstName,
              lastName: updatedUser?.lastName || data.lastName,
              email: updatedUser?.email || data.email,
              phone: updatedUser?.phone || data.phone,
              location: updatedUser?.location || data.location,
              locationCity: data.locationData?.city || updatedUser?.locationCity,
              locationState: data.locationData?.state || updatedUser?.locationState,
              locationStreet: data.locationData?.street || updatedUser?.locationStreet,
              locationZipCode: data.locationData?.zipCode || updatedUser?.locationZipCode,
              locationLat: data.locationData?.lat || updatedUser?.locationLat,
              locationLng: data.locationData?.lng || updatedUser?.locationLng,
            };
            localStorage.setItem('user_data', JSON.stringify(updatedUserData));
          } catch (storageError) {
            console.warn('Failed to update localStorage:', storageError);
          }
        } catch (error) {
          console.error('Backend API error:', error);
          toast.error('Update Failed', { description: 'There was a problem updating your profile. Please try again.' });
          throw new Error('Failed to update profile');
        }
      } else if (section === 'company') {
        // Fetch existing company by user
        const { data: existing, error: fetchErr } = await supabase
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (fetchErr) {
          console.warn('Company fetch error (optional):', fetchErr);
        }

        const isEmpty = !data?.companyName && !data?.industry && !data?.companySize && !data?.website &&
          !data?.address && !data?.city && !data?.state && !data?.zipCode && !data?.country &&
          !data?.description && !data?.logo && !data?.taxId;

        let dbError = null as any;
        if (isEmpty) {
          if (existing?.id) {
            const { error } = await supabase
              .from('companies')
              .delete()
              .eq('user_id', user.id);
            dbError = error;
          }
        } else {
          const payload = {
            user_id: user.id,
            company_name: data.companyName || null,
            industry: data.industry || null,
            company_size: data.companySize || null,
            website: data.website || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            zip_code: data.zipCode || null,
            country: data.country || null,
            description: data.description || null,
            logo: data.logo || null,
            tax_id: data.taxId || null,
          };

          if (existing?.id) {
            const { error } = await supabase
              .from('companies')
              .update(payload)
              .eq('user_id', user.id);
            dbError = error;
          } else {
            const { error } = await supabase
              .from('companies')
              .insert(payload);
            dbError = error;
          }
        }

        if (dbError) {
          console.error('Company save error:', dbError);
          toast.error('Update Failed', { description: 'There was a problem saving company info.' });
          throw new Error('Failed to update company');
        }

        // Rehydrate from server
        const { data: freshCompany } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfileData((prev: any) => ({
          ...prev,
          company: {
            companyName: freshCompany?.company_name || '',
            industry: freshCompany?.industry || '',
            companySize: (freshCompany?.company_size as any) || '1-10',
            website: freshCompany?.website || '',
            address: freshCompany?.address || '',
            city: freshCompany?.city || '',
            state: freshCompany?.state || '',
            zipCode: freshCompany?.zip_code || '',
            country: freshCompany?.country || 'United States',
            description: freshCompany?.description || '',
            logo: freshCompany?.logo || '',
            taxId: freshCompany?.tax_id || ''
          }
        }));
      } else if (section === 'notifications') {
        // Fetch existing preferences
        const { data: existingPrefs } = await supabase
          .from('notification_preferences')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        const payload = {
          user_id: user.id,
          order_updates: !!data.orderUpdates,
          vendor_messages: !!data.vendorMessages,
          promotions: !!data.promotions,
          reminders: !!data.reminders,
          newsletter: !!data.newsletter,
          product_updates: !!data.productUpdates,
          event_recaps: !!data.eventRecaps,
          account_alerts: !!data.accountAlerts,
        };

        let dbError = null as any;
        if (existingPrefs?.user_id) {
          const { error } = await supabase
            .from('notification_preferences')
            .update(payload)
            .eq('user_id', user.id);
          dbError = error;
        } else {
          const { error } = await supabase
            .from('notification_preferences')
            .insert(payload);
          dbError = error;
        }

        if (dbError) {
          console.error('Notification prefs save error:', dbError);
          toast.error('Update Failed', { description: 'Could not save notification preferences.' });
          throw new Error('Failed to update notifications');
        }

        // Rehydrate from server
        const { data: freshPrefs } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfileData((prev: any) => ({
          ...prev,
          notifications: {
            orderUpdates: freshPrefs?.order_updates ?? true,
            vendorMessages: freshPrefs?.vendor_messages ?? true,
            promotions: freshPrefs?.promotions ?? false,
            reminders: freshPrefs?.reminders ?? true,
            newsletter: freshPrefs?.newsletter ?? false,
            productUpdates: freshPrefs?.product_updates ?? true,
            eventRecaps: freshPrefs?.event_recaps ?? true,
            accountAlerts: freshPrefs?.account_alerts ?? true,
          }
        }));
      }

      // Success notification
      toast.success('Profile Updated', { description: 'Your changes have been saved.' });

    } catch (error) {
      console.error("Error updating profile:", error);
      
      // Detailed error message for users
      let errorMessage = "Failed to update profile";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error("Update Error", { description: errorMessage });
      
      return Promise.reject(error);
    }
  };

  return { updateProfile };
};







