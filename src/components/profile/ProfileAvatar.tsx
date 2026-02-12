
import React, { useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-profile";
import { useUserProfile } from "@/hooks/use-user-profile";

interface ProfileAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ProfileAvatar = ({ 
  className = "", 
  size = "md" 
}: ProfileAvatarProps) => {
  const { profileData, isLoading: profileLoading } = useProfile();
  const { profile: userProfile, loading: userProfileLoading, refetch: refetchUserProfile } = useUserProfile();
  
  const isLoading = profileLoading || userProfileLoading;
  
  // Listen for profile image updates and refetch
  useEffect(() => {
    const handleProfileImageUpdate = () => {
      refetchUserProfile();
    };
    
    window.addEventListener('profile-image-updated', handleProfileImageUpdate);
    return () => {
      window.removeEventListener('profile-image-updated', handleProfileImageUpdate);
    };
  }, [refetchUserProfile]);
  
  // Prioritize API data (userProfile) over localStorage data (profileData)
  const imageUrl = userProfile?.imageUrl || profileData?.personal.profileImage;
  const firstName = userProfile?.firstName || profileData?.personal.firstName || "";
  const lastName = userProfile?.lastName || profileData?.personal.lastName || "";
  
  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return "?";
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  if (isLoading) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback className="bg-gray-200 animate-pulse" />
      </Avatar>
    );
  }
  
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {imageUrl ? (
        <AvatarImage 
          src={imageUrl} 
          alt={`${firstName}'s profile`}
          className="object-cover"
        />
      ) : null}
      <AvatarFallback className="bg-[#F07712] text-white">
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
