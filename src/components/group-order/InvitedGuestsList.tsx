
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, X, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface InvitedGuest {
  email: string;
}

interface InvitedGuestsListProps {
  invitedGuests: InvitedGuest[];
  onRemoveGuest: (email: string) => void;
  onAddGuest: (email: string) => void;
}

function InvitedGuestsList({ invitedGuests, onRemoveGuest, onAddGuest }: InvitedGuestsListProps) {
  const { toast } = useToast();
  const [newGuestEmail, setNewGuestEmail] = useState("");

  const handleAddGuest = () => {
    if (!newGuestEmail) return;
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newGuestEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    onAddGuest(newGuestEmail);
    setNewGuestEmail("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm">Invite Friends</label>
        <div className="flex gap-3">
          <Input
            placeholder="Enter Email Address"
            value={newGuestEmail}
            onChange={(e) => setNewGuestEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddGuest} className="bg-[#469A7E] hover:bg-[#469A7E]/90">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {invitedGuests.map((guest) => (
          <div
            key={guest.email}
            className="flex items-center justify-between p-4 border rounded-lg bg-white"
          >
            <div className="flex items-center gap-4">
              <User className="h-10 w-10 p-2 bg-gray-100 rounded-full text-gray-500" />
              <span className="text-sm font-medium">{guest.email}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveGuest(guest.email)}
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InvitedGuestsList;
