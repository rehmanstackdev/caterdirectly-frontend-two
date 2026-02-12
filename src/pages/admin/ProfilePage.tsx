
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import NotificationsForm from "@/components/profile/NotificationsForm";
import PaymentMethodsForm from "@/components/profile/PaymentMethodsForm";

function ProfilePage() {
  return (
    <Dashboard userRole="admin" activeTab="profile">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile Management</CardTitle>
            <CardDescription>
              Update your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="payment">Payment Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="personal">
                <PersonalInfoForm />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationsForm />
              </TabsContent>
              <TabsContent value="payment">
                <PaymentMethodsForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}

export default ProfilePage;
