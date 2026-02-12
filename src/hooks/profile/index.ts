
import { useProfileFetch } from './use-profile-fetch';
import { useProfileUpdate } from './use-profile-update';
import { mockProfileData } from './mock-data';
import { Profile } from '@/types/profile';

// Main useProfile hook that combines fetch and update functionality
export const useProfile = () => {
  const { profileData, isLoading, error, setProfileData } = useProfileFetch();
  const { updateProfile } = useProfileUpdate(setProfileData);

  return {
    profileData,
    isLoading,
    error,
    updateProfile
  };
};

// Export for use in other files
export { mockProfileData };
export type { Profile };
