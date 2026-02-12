
import { Profile } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Helper function to convert any user type string to a valid type in our Profile interface
export const mapUserType = (userType: string | null): "eventPlanner" | "officeManager" | "individual" | "corporate" | "other" => {
  switch (userType?.toLowerCase()) {
    case 'eventplanner':
    case 'event_planner':
    case 'event planner':
      return 'eventPlanner';
    case 'officemanager':
    case 'office_manager':
    case 'office manager':
      return 'officeManager';
    case 'individual':
      return 'individual';
    case 'corporate':
      return 'corporate';
    default:
      return 'other';
  }
};

// Function to update profile in Supabase
export const updateSupabaseProfile = async (userId: string, profileData: any) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        job_title: profileData.jobTitle,
        user_type: profileData.userType,
        profile_image: profileData.profileImage
      })
      .eq('id', userId);
      
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error updating profile:", error);
    
    // More detailed error reporting
    if (error instanceof Error) {
      toast({
        title: "Database Error",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
    
    return false;
  }
};

// Function to transform Supabase profile data to our app's Profile interface
export const transformProfileData = (profilesData: any, user: any, mockData: Profile): Profile => {
  try {
    return {
      personal: {
        firstName: profilesData.first_name || '',
        lastName: profilesData.last_name || '',
        email: profilesData.email || user.email || '',
        phone: profilesData.phone || '',
        jobTitle: profilesData.job_title || '',
        userType: mapUserType(profilesData.user_type),
        profileImage: profilesData.profile_image || ''
      },
      company: {
        // If we have company data in the future, map it here
        companyName: mockData.company.companyName,
        industry: mockData.company.industry,
        companySize: mockData.company.companySize,
        website: mockData.company.website,
        address: mockData.company.address,
        city: mockData.company.city,
        state: mockData.company.state,
        zipCode: mockData.company.zipCode,
        country: mockData.company.country,
        description: mockData.company.description,
        logo: mockData.company.logo,
        taxId: mockData.company.taxId
      },
      paymentMethods: mockData.paymentMethods,
      notifications: mockData.notifications
    };
  } catch (error) {
    console.error("Error transforming profile data:", error);
    toast({
      title: "Data Transformation Error",
      description: "There was a problem processing your profile data",
      variant: "destructive"
    });
    
    // Return mock data as fallback
    return mockData;
  }
};
