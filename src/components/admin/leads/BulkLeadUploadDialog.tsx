import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import FileUpload from "@/components/shared/FileUpload";
import { useBulkLeadUpload } from "@/hooks/admin/use-bulk-lead-upload";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Upload, FileSpreadsheet } from "lucide-react";
import type { CreateLeadForm } from "@/types/crm-types";

interface BulkLeadUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedLead extends CreateLeadForm {
  rowNumber: number;
  errors?: string[];
}

export function BulkLeadUploadDialog({ isOpen, onClose }: BulkLeadUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedLeads, setParsedLeads] = useState<ParsedLead[]>([]);
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'processing' | 'results'>('upload');
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  const bulkUpload = useBulkLeadUpload();

  const parseCSV = (csvText: string): ParsedLead[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads: ParsedLead[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const errors: string[] = [];
      
      const lead: ParsedLead = {
        rowNumber: i + 1,
        email: '',
        first_name: '',
        last_name: '',
        company_name: '',
        phone: '',
        job_title: '',
        lead_type: 'event_host',
        priority_level: 3,
        estimated_value: 0,
        expected_close_date: '',
        source: '',
        assigned_admin_users: [],
        affiliate_id: '',
        notes: ''
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'email':
            lead.email = value;
            if (!value) errors.push('Email is required');
            else if (!/\S+@\S+\.\S+/.test(value)) errors.push('Invalid email format');
            break;
          case 'first_name':
            lead.first_name = value;
            break;
          case 'last_name':
            lead.last_name = value;
            break;
          case 'company_name':
            lead.company_name = value;
            break;
          case 'phone':
            lead.phone = value;
            break;
          case 'job_title':
            lead.job_title = value;
            break;
          case 'lead_type':
            if (value && ['vendor', 'event_host'].includes(value)) {
              lead.lead_type = value as 'vendor' | 'event_host';
            }
            break;
          case 'priority_level':
            const priority = parseInt(value);
            if (priority >= 1 && priority <= 5) {
              lead.priority_level = priority;
            }
            break;
          case 'estimated_value':
            const value_num = parseFloat(value);
            if (!isNaN(value_num) && value_num >= 0) {
              lead.estimated_value = value_num;
            }
            break;
          case 'source':
            lead.source = value;
            break;
          case 'notes':
            lead.notes = value;
            break;
        }
      });

      if (errors.length > 0) {
        lead.errors = errors;
      }

      leads.push(lead);
    }

    return leads;
  };

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsed = parseCSV(csvText);
      setParsedLeads(parsed);
      setUploadStep('preview');
    };
    reader.readAsText(uploadedFile);
  };

  const handleBulkUpload = async () => {
    if (parsedLeads.length === 0) return;

    setUploadStep('processing');
    
    try {
      const validLeads = parsedLeads.filter(lead => !lead.errors || lead.errors.length === 0);
      const result = await bulkUpload.mutateAsync(validLeads);
      
      setUploadResults({
        successful: result.successful,
        failed: result.failed,
        errors: result.errors || []
      });
      setUploadStep('results');
    } catch (error) {
      console.error('Bulk upload failed:', error);
      setUploadResults({
        successful: 0,
        failed: parsedLeads.length,
        errors: [{ row: 0, error: 'Upload failed completely' }]
      });
      setUploadStep('results');
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedLeads([]);
    setUploadStep('upload');
    setUploadResults(null);
    onClose();
  };

  const validLeads = parsedLeads.filter(lead => !lead.errors || lead.errors.length === 0);
  const invalidLeads = parsedLeads.filter(lead => lead.errors && lead.errors.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Lead Upload
          </DialogTitle>
        </DialogHeader>

        {uploadStep === 'upload' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                CSV Format Requirements
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                Upload a CSV file with the following columns (header row required):
              </p>
              <code className="text-xs bg-blue-100 p-2 rounded block">
                email,first_name,last_name,company_name,phone,job_title,lead_type,priority_level,estimated_value,source,notes
              </code>
              <div className="mt-2 text-xs text-blue-700">
                <p>• <strong>email</strong> is required</p>
                <p>• <strong>lead_type</strong> should be 'vendor' or 'event_host'</p>
                <p>• <strong>priority_level</strong> should be 1-5 (1=high, 5=low)</p>
              </div>
            </div>

            <FileUpload
              onFileUpload={handleFileUpload}
              onFileUploadComplete={() => {}}
              acceptedFileTypes={['.csv']}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>
        )}

        {uploadStep === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Preview Leads ({parsedLeads.length} total)</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {validLeads.length} valid
                  </span>
                  <span className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-600" />
                    {invalidLeads.length} invalid
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setUploadStep('upload')}>
                  Back
                </Button>
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={validLeads.length === 0 || bulkUpload.isPending}
                >
                  Upload {validLeads.length} Valid Leads
                </Button>
              </div>
            </div>

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Row</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedLeads.map((lead, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {lead.errors && lead.errors.length > 0 ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </TableCell>
                      <TableCell>{lead.rowNumber}</TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{[lead.first_name, lead.last_name].filter(Boolean).join(' ')}</TableCell>
                      <TableCell>{lead.company_name}</TableCell>
                      <TableCell>
                        <Badge variant={lead.lead_type === 'vendor' ? 'default' : 'secondary'}>
                          {lead.lead_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.priority_level}</TableCell>
                      <TableCell>
                        {lead.errors && lead.errors.length > 0 && (
                          <div className="text-xs text-red-600">
                            {lead.errors.join(', ')}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {uploadStep === 'processing' && (
          <div className="space-y-4 text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Upload className="h-6 w-6 animate-spin" />
              <span className="text-lg font-medium">Processing Leads...</span>
            </div>
            <Progress value={bulkUpload.isPending ? 50 : 100} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground">
              Uploading {validLeads.length} leads to the system...
            </p>
          </div>
        )}

        {uploadStep === 'results' && uploadResults && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium text-lg mb-4">Upload Complete</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{uploadResults.successful}</div>
                  <div className="text-sm text-green-800">Successful</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{uploadResults.failed}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
              </div>
            </div>

            {uploadResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Upload Errors
                </h4>
                <div className="space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-800">
                      Row {error.row}: {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}