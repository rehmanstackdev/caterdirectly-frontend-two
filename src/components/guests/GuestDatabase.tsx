import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGuests } from "@/hooks/use-guests";
import GuestEntryDialog from "./GuestEntryDialog";
import { toast } from "sonner";

interface GuestDatabaseProps {
  filterRecent?: boolean;
}

const GuestDatabase = ({ filterRecent = false }: GuestDatabaseProps) => {
  const { guests, loading, total, pageSize, removeGuest, reload } = useGuests(filterRecent);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<any | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      reload(searchQuery, filterRecent, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await reload(searchQuery, filterRecent, page);
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
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Event</TableHead>
  
              <TableHead>Ticket</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="h-8 w-8 animate-spin text-[#F07712]" />
                    <p className="text-gray-500">Loading guests...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : guests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-12 text-center text-gray-500">
                  {searchQuery
                    ? `No contacts found matching "${searchQuery}"`
                    : filterRecent
                      ? "No recent event guests found."
                      : "You don't have any contacts yet."}
                </TableCell>
              </TableRow>
            ) : (
              guests.map((guest) => (
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
                  <TableCell>{guest.company || "-"}</TableCell>
                  <TableCell>{guest.jobTitle || "-"}</TableCell>
                  <TableCell>{guest.eventTitle || "-"}</TableCell>
                  <TableCell>{guest.ticketName || "-"}</TableCell>
                  <TableCell>{guest.ticketPrice ? `$${guest.ticketPrice}` : "-"}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => handleEditGuest(guest)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} &middot; {total} total
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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
