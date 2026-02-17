import React, { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Upload,
  Download,
  File,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const GuestImport = () => {
  const { importGuests, exportGuests, loading } = useGuests();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importTab, setImportTab] = useState("upload");
  const [importStatus, setImportStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [importResults, setImportResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    duplicates: number;
  }>({
    total: 0,
    successful: 0,
    failed: 0,
    duplicates: 0,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
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

    setImportStatus("processing");

    try {
      const results = await importGuests(selectedFile);
      setImportResults(results);
      setImportStatus("success");
      toast.success(`Successfully imported ${results.successful} guests`);
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus("error");
      toast.error("Failed to import guests. Please check your file format.");
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

  const downloadTemplate = () => {
    // Create CSV template
    const template = "Name,Email,Phone,Company,Job Title,Event Title";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "guest_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Tabs value={importTab} onValueChange={setImportTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="upload">Import Guest Contacts</TabsTrigger>
          <TabsTrigger value="export">Export Guest Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Import Guests</CardTitle>
                <CardDescription>
                  Upload a CSV or XLSX file with your guest data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importStatus === "idle" || importStatus === "error" ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <div className="flex justify-center mb-4">
                        <Upload className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Drag and drop your CSV/XLSX file here, or click to
                        browse
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
                      <p className="font-medium">
                        CSV/XLSX Format Requirements:
                      </p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>File must be in CSV or XLSX format</li>
                        <li>First row should contain column headers</li>
                        <li>Required columns: Name, Email</li>
                        <li>
                          Optional columns: Phone, Company, JobTitle, Tags
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : importStatus === "processing" ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-2 border-[#F07712] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Processing your file...</p>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h3 className="text-lg font-medium">Import Complete</h3>
                    <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold">
                          {importResults.total}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Added</p>
                        <p className="text-xl font-bold text-green-600">
                          {importResults.successful}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-600">Duplicates</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {importResults.duplicates}
                        </p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">Failed</p>
                        <p className="text-xl font-bold text-red-600">
                          {importResults.failed}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={!selectedFile || importStatus === "processing"}
                >
                  Import
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Tips</CardTitle>
                <CardDescription>
                  How to prepare your data for import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Follow these guidelines to ensure your guest data imports
                  correctly:
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700">
                      Start with a template
                    </h4>
                    <p className="text-sm text-blue-600">
                      Download our template to ensure your data is formatted
                      correctly.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700">
                      Required fields
                    </h4>
                    <p className="text-sm text-blue-600">
                      Make sure each entry has at least a name and email
                      address.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700">Tags</h4>
                    <p className="text-sm text-blue-600">
                      Separate multiple tags with semicolons (e.g.,
                      "VIP;Friend;Colleague").
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700">Duplicates</h4>
                    <p className="text-sm text-blue-600">
                      Entries with emails matching existing contacts will update
                      those contacts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

export default GuestImport;
