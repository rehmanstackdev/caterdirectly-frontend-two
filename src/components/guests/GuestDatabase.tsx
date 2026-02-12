import { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, MoreVertical, Mail, Plus, Pencil, Trash2 } from "lucide-react";
import { useGuests } from "@/hooks/use-guests";
import GuestEntryDialog from "./GuestEntryDialog";
import { toast } from "sonner";

interface GuestDatabaseProps {
  filterRecent?: boolean;
}

const GuestDatabase = ({ filterRecent = false }: GuestDatabaseProps) => {
  const { guests, loading, removeGuest } = useGuests();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<any | null>(null);

  // Filter guests based on search query and filterRecent flag
  const filteredGuests = guests.filter((guest) => {
    const searchMatch =
      !searchQuery ||
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.company || "").toLowerCase().includes(searchQuery.toLowerCase());

    const recentMatch = !filterRecent || guest.recentEvent === true;
    return searchMatch && recentMatch;
  });

  const handleAddGuest = () => {
    setEditGuest(null);
    setIsAddGuestDialogOpen(true);
  };

  const handleEditGuest = (guest: any) => {
    setEditGuest(guest);
    setIsAddGuestDialogOpen(true);
  };

  const handleRemoveGuest = async (guestId: string) => {
    try {
      await removeGuest(guestId);
      toast.success("Contact removed");
    } catch (err) {
      console.error("Failed to remove contact:", err);
      toast.error("Failed to remove contact");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading guest database...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            className="pl-10 w-full md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredGuests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery
                  ? `No contacts found matching "${searchQuery}"`
                  : "You don't have any contacts yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Event History</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">{guest.name}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${guest.email}`}
                      className="hover:underline"
                    >
                      {guest.email}
                    </a>
                  </TableCell>
                  <TableCell>{guest.phone || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {guest.tags?.length
                        ? guest.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        : "-"}
                    </div>
                  </TableCell>
                  <TableCell>{guest.eventCount || 0} events</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Contact actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleEditGuest(guest)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`mailto:${guest.email}`}
                            className="flex items-center"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          View Event History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleRemoveGuest(guest.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <GuestEntryDialog
        open={isAddGuestDialogOpen}
        onOpenChange={setIsAddGuestDialogOpen}
        existingGuest={editGuest || undefined}
      />
    </div>
  );
};

export default GuestDatabase;
