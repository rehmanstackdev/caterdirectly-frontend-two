import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { UserRole } from "@/components/dashboard/DashboardNav";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileAvatarWithDropdownProps {
  userRole: UserRole;
  onLogout: () => void;
  className?: string;
}

const ProfileAvatarWithDropdown = ({
  userRole,
  onLogout,
  className = "",
}: ProfileAvatarWithDropdownProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    switch (userRole) {
      case "vendor":
        navigate("/vendor/settings");
        break;
      case "admin":
        navigate("/admin/profile");
        break;
      case "event-host":
      default:
        navigate("/host/EventhostAccountinfo");
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none" aria-label="User profile">
          <ProfileAvatar className={className} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileAvatarWithDropdown;
