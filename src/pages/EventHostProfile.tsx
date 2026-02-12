
import Dashboard from "@/components/dashboard/Dashboard";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import { useProfile } from "@/hooks/use-profile";

const EventHostProfile = () => {
  const { profileData, isLoading } = useProfile();

  return (
    <Dashboard activeTab="profile" userRole="event-host">
      <div className="space-y-4 md:space-y-6 px-3 md:px-0 overflow-x-hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F07712] to-[#FFB473] bg-clip-text text-transparent">Profile</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-[#F07712] rounded-full"></div>
          </div>
        ) : (
          <PersonalInfoForm initialData={profileData?.personal} />
        )}
      </div>
    </Dashboard>
  );
};

export default EventHostProfile;