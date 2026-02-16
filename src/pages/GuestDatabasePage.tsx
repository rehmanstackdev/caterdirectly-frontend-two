import React, { useState } from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GuestDatabase from "@/components/guests/GuestDatabase";
import GuestImport from "@/components/guests/GuestImport";
import { Button } from "@/components/ui/button";
import { useGuests } from "@/hooks/use-guests";
import { Loader } from "lucide-react";
import GuestEntryDialog from "@/components/guests/GuestEntryDialog";

const GuestDatabasePage = () => {
  const { loading } = useGuests();
  const [activeTab, setActiveTab] = React.useState("all-guests");
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<any | null>(null);

  const handleAddGuest = () => {
    setEditGuest(null);
    setIsAddGuestDialogOpen(true);
  };
  if (loading) {
    return (
      <Dashboard activeTab="guests" userRole="event-host">
        <div className="h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
            <p className="text-gray-500">Loading guest list...</p>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard activeTab="guests" userRole="event-host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Guest List</h1>
            <p className="text-gray-500">
              Manage your contacts and event guests
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab("import")}>
              Import Guests
            </Button>
            <Button onClick={handleAddGuest}>Add Guest</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all-guests">All Guests Contacts</TabsTrigger>
            <TabsTrigger value="recent-guests">Recent Event Guests</TabsTrigger>
            <TabsTrigger value="import">Import & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="all-guests">
            <GuestDatabase />
          </TabsContent>

          <TabsContent value="recent-guests">
            <GuestDatabase filterRecent={true} />
          </TabsContent>

          <TabsContent value="import">
            <GuestImport />
          </TabsContent>
        </Tabs>
      </div>

      <GuestEntryDialog
        open={isAddGuestDialogOpen}
        onOpenChange={setIsAddGuestDialogOpen}
        existingGuest={editGuest || undefined}
      />
    </Dashboard>
  );
};

export default GuestDatabasePage;
