import React, { useState, useEffect, useMemo } from "react";
import { useGuests } from "@/hooks/use-guests";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  File,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import EventsService from "@/services/api/host/events.Service";
import * as XLSX from "xlsx";

interface EventTicket {
  id: string;
  ticketName: string;
  price: string;
}

interface HostEvent {
  id: string;
  title: string;
  startDateTime?: string;
  tickets?: EventTicket[];
}

interface ParsedGuest {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  eventId: string;
  ticketId: string;
}

// Searchable event combobox with scrollable list
const EventCombobox = ({
  events,
  value,
  onSelect,
  disabled,
  placeholder = "Select event",
  triggerClassName,
}: {
  events: HostEvent[];
  value: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  triggerClassName?: string;
}) => {
  const [open, setOpen] = useState(false);
  const selectedEvent = events.find((e) => e.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !selectedEvent && "text-muted-foreground",
            triggerClassName,
          )}
        >
          <span className="truncate">
            {selectedEvent ? selectedEvent.title : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search events..." />
          <CommandList className="max-h-[176px]">
            <CommandEmpty>No events found.</CommandEmpty>
            <CommandGroup>
              {events.map((event) => (
                <CommandItem
                  key={event.id}
                  value={event.title}
                  onSelect={() => {
                    onSelect(event.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === event.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {event.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const GuestImport = () => {
  const { importGuests, exportGuests, loading } = useGuests();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importTab, setImportTab] = useState("upload");
  const [importStatus, setImportStatus] = useState<
    "idle" | "parsed" | "processing" | "success" | "error"
  >("idle");
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    duplicates: number;
  }>({ total: 0, successful: 0, failed: 0, duplicates: 0 });

  // Parsed guests from CSV
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);

  // Events data
  const [hostEvents, setHostEvents] = useState<HostEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Load host events on mount
  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true);
      try {
        const response = await EventsService.getHostEvents();
        const events = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        // Filter to only show upcoming events
        const now = new Date();
        const upcomingEvents = events.filter((event: HostEvent) => {
          if (!event.startDateTime) return true;
          return new Date(event.startDateTime) >= now;
        });
        setHostEvents(upcomingEvents);
      } catch (error) {
        console.error("Failed to load host events:", error);
      } finally {
        setEventsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Parse file and move to assignment step
  const handleParseFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to import");
      return;
    }

    const fileName = selectedFile.name.toLowerCase();
    const isCsv = selectedFile.type === "text/csv" || fileName.endsWith(".csv");
    const isXlsx =
      selectedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileName.endsWith(".xlsx");

    if (!isCsv && !isXlsx) {
      toast.error("Please upload a CSV or XLSX file");
      return;
    }

    try {
      const rows = await parseFile(selectedFile, isCsv);
      if (rows.length === 0) {
        toast.error("No valid guest rows found in the file");
        return;
      }
      setParsedGuests(rows.map((r) => ({ ...r, eventId: "", ticketId: "" })));
      setImportStatus("parsed");
      toast.success(`Parsed ${rows.length} guests from file`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to parse file");
    }
  };

  // Submit bulk import
  const handleBulkImport = async () => {
    // Validate all guests have event+ticket
    const incomplete = parsedGuests.filter((g) => !g.eventId || !g.ticketId);
    if (incomplete.length > 0) {
      toast.error(`${incomplete.length} guest(s) are missing event or ticket selection`);
      return;
    }

    setImportStatus("processing");

    try {
      const results = await importGuests(parsedGuests);
      setImportResults(results);
      setImportStatus("success");
      toast.success(`Successfully imported ${results.successful} guests`);
    } catch (error: any) {
      console.error("Import error:", error);
      setImportStatus("error");
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to import guests";
      toast.error(message);
    }
  };

  const handleExport = async () => {
    try {
      await exportGuests();
      toast.success("Guest list exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export guest list");
    }
  };

  const handleReset = () => {
    setImportStatus("idle");
    setSelectedFile(null);
    setParsedGuests([]);
    setImportResults({ total: 0, successful: 0, failed: 0, duplicates: 0 });
  };

  const downloadTemplate = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Job Title"];
    const sampleData = [
      ["Jane Smith", "jane@example.com", "(555) 123-4567", "Acme Corp", "Marketing Manager"],
      ["John Doe", "john.doe@example.com", "(555) 987-6543", "TechStart Inc", "Software Engineer"],
      ["Sarah Johnson", "sarah.j@example.com", "(555) 456-7890", "EventPro LLC", "Event Coordinator"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 28 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");

    const xlsxBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([xlsxBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest_import_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const updateGuestField = (index: number, field: keyof ParsedGuest, value: string) => {
    setParsedGuests((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Clear ticketId when event changes
      if (field === "eventId") {
        updated[index].ticketId = "";
      }
      return updated;
    });
  };

  const removeGuest = (index: number) => {
    setParsedGuests((prev) => prev.filter((_, i) => i !== index));
  };

  // Apply same event+ticket to all guests
  const [bulkEventId, setBulkEventId] = useState("");
  const [bulkTicketId, setBulkTicketId] = useState("");
  const bulkTickets = useMemo(() => {
    if (!bulkEventId) return [];
    return hostEvents.find((e) => e.id === bulkEventId)?.tickets || [];
  }, [bulkEventId, hostEvents]);

  const applyBulkSelection = () => {
    if (!bulkEventId || !bulkTicketId) {
      toast.error("Select both event and ticket to apply to all");
      return;
    }
    setParsedGuests((prev) =>
      prev.map((g) => ({ ...g, eventId: bulkEventId, ticketId: bulkTicketId })),
    );
    toast.success("Applied to all guests");
  };

  const getTicketsForEvent = (eventId: string): EventTicket[] => {
    if (!eventId) return [];
    return hostEvents.find((e) => e.id === eventId)?.tickets || [];
  };

  const allAssigned = parsedGuests.length > 0 && parsedGuests.every((g) => g.eventId && g.ticketId);

  return (
    <div className="space-y-6">
      <Tabs value={importTab} onValueChange={setImportTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload">Import Guest Contacts</TabsTrigger>
          <TabsTrigger value="export">Export Guest Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          {/* Step 1: Upload File */}
          {(importStatus === "idle" || importStatus === "error") && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Import Guests</CardTitle>
                  <CardDescription>
                    Upload a CSV or XLSX file with your guest data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <Upload className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop your CSV/XLSX file here, or click to browse
                      </p>
                      <Input
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileChange}
                        className="mt-2"
                      />
                      {selectedFile && (
                        <div className="mt-4 text-sm flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span>{selectedFile.name}</span>
                        </div>
                      )}
                    </div>

                    {importStatus === "error" && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Import Failed</AlertTitle>
                        <AlertDescription>
                          There was an error importing your contacts. Please
                          check your file format and try again.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="text-sm text-gray-500">
                      <p className="font-medium">CSV/XLSX Format Requirements:</p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>File must be in CSV or XLSX format</li>
                        <li>First row should contain column headers</li>
                        <li>Required columns: Name, Email</li>
                        <li>Optional columns: Phone, Company, Job Title</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Template
                  </Button>
                  <Button
                    onClick={handleParseFile}
                    disabled={!selectedFile}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Next: Assign Events
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Import Tips</CardTitle>
                  <CardDescription>How to prepare your data for import</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Follow these guidelines to ensure your guest data imports correctly:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-700">Start with a template</h4>
                      <p className="text-sm text-blue-600">
                        Download our template to ensure your data is formatted correctly.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-700">Required fields</h4>
                      <p className="text-sm text-blue-600">
                        Make sure each entry has at least a name and email address.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-700">Assign Events & Tickets</h4>
                      <p className="text-sm text-blue-600">
                        After uploading, you'll assign an event and ticket to each guest
                        individually, or apply one to all at once.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-700">Duplicates</h4>
                      <p className="text-sm text-blue-600">
                        Guests with emails already registered for the same event will be
                        skipped automatically.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Assign Event + Ticket per guest */}
          {importStatus === "parsed" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assign Events & Tickets</CardTitle>
                    <CardDescription>
                      {parsedGuests.length} guest(s) parsed — assign an event and ticket to each guest
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bulk assign section */}
                <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                  <Label className="text-sm font-semibold">Apply to all guests</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Event</Label>
                      <EventCombobox
                        events={hostEvents}
                        value={bulkEventId}
                        onSelect={(v) => { setBulkEventId(v); setBulkTicketId(""); }}
                        disabled={eventsLoading}
                        placeholder="Select event"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ticket</Label>
                      <Select
                        value={bulkTicketId}
                        onValueChange={setBulkTicketId}
                        disabled={!bulkEventId || bulkTickets.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={!bulkEventId ? "Select event first" : "Select ticket"} />
                        </SelectTrigger>
                        <SelectContent>
                          {bulkTickets.map((ticket) => (
                            <SelectItem key={ticket.id} value={ticket.id}>
                              {ticket.ticketName} - ${ticket.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={applyBulkSelection}
                      disabled={!bulkEventId || !bulkTicketId}
                      variant="secondary"
                    >
                      Apply to All
                    </Button>
                  </div>
                </div>

                {/* Per-guest assignment table */}
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium min-w-[200px]">Event *</th>
                        <th className="text-left p-3 font-medium min-w-[200px]">Ticket *</th>
                        <th className="text-left p-3 font-medium w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedGuests.map((guest, index) => {
                        const guestTickets = getTicketsForEvent(guest.eventId);
                        return (
                          <tr key={`${index}-${guest.eventId}-${guest.ticketId}`} className="border-b last:border-b-0 hover:bg-muted/30">
                            <td className="p-3 text-muted-foreground">{index + 1}</td>
                            <td className="p-3 font-medium">{guest.name}</td>
                            <td className="p-3 text-muted-foreground">{guest.email}</td>
                            <td className="p-3">
                              <EventCombobox
                                key={`event-${index}-${guest.eventId}`}
                                events={hostEvents}
                                value={guest.eventId}
                                onSelect={(v) => updateGuestField(index, "eventId", v)}
                                placeholder="Select event"
                                triggerClassName="h-9"
                              />
                            </td>
                            <td className="p-3">
                              <Select
                                key={`ticket-${index}-${guest.eventId}-${guest.ticketId}`}
                                value={guest.ticketId || undefined}
                                onValueChange={(v) => updateGuestField(index, "ticketId", v)}
                                disabled={!guest.eventId || guestTickets.length === 0}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={
                                    !guest.eventId
                                      ? "Select event first"
                                      : guestTickets.length === 0
                                        ? "No tickets"
                                        : "Select ticket"
                                  } />
                                </SelectTrigger>
                                <SelectContent>
                                  {guestTickets.map((ticket) => (
                                    <SelectItem key={ticket.id} value={ticket.id}>
                                      {ticket.ticketName} - ${ticket.price}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeGuest(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {parsedGuests.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    All guests have been removed.
                    <Button variant="link" onClick={handleReset}>Start over</Button>
                  </div>
                )}
              </CardContent>
              {parsedGuests.length > 0 && (
                <CardFooter className="justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    {parsedGuests.filter((g) => g.eventId && g.ticketId).length} of {parsedGuests.length} guests assigned
                  </p>
                  <Button
                    onClick={handleBulkImport}
                    disabled={!allAssigned}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Import {parsedGuests.length} Guest{parsedGuests.length !== 1 ? "s" : ""}
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {/* Processing */}
          {importStatus === "processing" && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-[#F07712] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Importing {parsedGuests.length} guests...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success */}
          {importStatus === "success" && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium">Import Complete</h3>
                  <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-xl font-bold">{importResults.total}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Added</p>
                      <p className="text-xl font-bold text-green-600">{importResults.successful}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600">Duplicates</p>
                      <p className="text-xl font-bold text-yellow-600">{importResults.duplicates}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Failed</p>
                      <p className="text-xl font-bold text-red-600">{importResults.failed}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleReset} className="mt-4">
                    Import Another Batch
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Guest List</CardTitle>
              <CardDescription>
                Download your contacts as an Excel file (.xlsx)
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="flex justify-center mb-4">
                <Download className="h-16 w-16 text-gray-400" />
              </div>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Export your complete guest database to an Excel file that you
                can open in Excel or Google Sheets with wider columns.
              </p>
              <Button onClick={handleExport} disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                Export All Guest Contacts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Parse CSV/XLSX file into raw guest rows
function parseFile(
  file: File,
  isCsv: boolean,
): Promise<Array<{ name: string; email: string; phone?: string; companyName?: string; jobTitle?: string }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const rows: Array<{
          name: string;
          email: string;
          phone?: string;
          companyName?: string;
          jobTitle?: string;
        }> = [];

        if (isCsv) {
          const csv = (e.target?.result as string) || "";
          const lines = csv.split("\n").map((l) => l.replace(/\r$/, ""));
          if (lines.length <= 1) return resolve([]);

          const headers = lines[0].split(",").map((h) => h.trim());
          if (!headers.includes("Name") || !headers.includes("Email")) {
            reject(new Error("CSV file must include 'Name' and 'Email' columns"));
            return;
          }

          const nameIdx = headers.indexOf("Name");
          const emailIdx = headers.indexOf("Email");
          const phoneIdx = headers.indexOf("Phone");
          const companyIdx = headers.indexOf("Company");
          const jobIdx =
            headers.indexOf("JobTitle") >= 0
              ? headers.indexOf("JobTitle")
              : headers.indexOf("Job Title");

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line || !line.trim()) continue;
            const values = line.split(",").map((v) => v.trim());
            const name = values[nameIdx]?.replace(/^"|"$/g, "");
            const email = values[emailIdx]?.replace(/^"|"$/g, "").toLowerCase();
            if (!name || !email) continue;
            rows.push({
              name,
              email,
              phone: phoneIdx >= 0 ? values[phoneIdx]?.replace(/^"|"$/g, "") || undefined : undefined,
              companyName: companyIdx >= 0 ? values[companyIdx]?.replace(/^"|"$/g, "") || undefined : undefined,
              jobTitle: jobIdx >= 0 ? values[jobIdx]?.replace(/^"|"$/g, "") || undefined : undefined,
            });
          }
        } else {
          const data = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.SheetNames[0];
          if (!firstSheet) return resolve([]);

          const worksheet = workbook.Sheets[firstSheet];
          const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

          const getValue = (row: Record<string, unknown>, keys: string[]) => {
            for (const key of keys) {
              const value = row[key];
              if (value !== undefined && value !== null && String(value).trim() !== "") {
                return String(value).trim();
              }
            }
            return "";
          };

          for (const row of sheetRows) {
            const name = getValue(row, ["Name", "name"]);
            const email = getValue(row, ["Email", "email"]).toLowerCase();
            if (!name || !email) continue;
            rows.push({
              name,
              email,
              phone: getValue(row, ["Phone", "phone"]) || undefined,
              companyName: getValue(row, ["Company", "company"]) || undefined,
              jobTitle: getValue(row, ["JobTitle", "Job Title", "jobTitle", "job title"]) || undefined,
            });
          }
        }

        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export default GuestImport;
