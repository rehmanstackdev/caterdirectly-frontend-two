
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from "./PersonalInfoForm";
import CompanyInfoForm from "./CompanyInfoForm";
import PaymentMethodsForm from "./PaymentMethodsForm";
import NotificationsForm from "./NotificationsForm";
import { useProfile } from "@/hooks/use-profile";

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const { profileData, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="personal" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="company">Company Info</TabsTrigger>
        <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="personal">
        <PersonalInfoForm initialData={profileData?.personal} />
      </TabsContent>
      
      <TabsContent value="company">
        <CompanyInfoForm initialData={profileData?.company} />
      </TabsContent>
      
      <TabsContent value="payment">
        <PaymentMethodsForm initialData={profileData?.paymentMethods} />
      </TabsContent>
      
      <TabsContent value="notifications">
        <NotificationsForm initialData={profileData?.notifications} />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
