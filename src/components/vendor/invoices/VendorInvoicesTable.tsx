import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  eventName: string;
  companyName: string;
  status: string;
  invoiceStatus: string;
  groupBy: boolean;
  eventDate: string;
  guestCount: number;
  contactName: string;
  emailAddress: string;
  services: any[];
  createdAt: string;
}

interface VendorInvoicesTableProps {
  invoices: Invoice[];
  loading: boolean;
}

const getStatusBadge = (status: string, invoiceStatus: string) => {
  if (status === 'paid') {
    return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
  }
  
  switch (invoiceStatus) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case 'accepted':
      return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
    case 'canceled':
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
  }
};

const calculateTotal = (services: any[]) => {
  return services.reduce((total, service) => total + parseFloat(service.totalPrice || 0), 0);
};

export default function VendorInvoicesTable({ invoices, loading }: VendorInvoicesTableProps) {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Name</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No invoices found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Event Name</TableHead>
          <TableHead>Event Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              <div>
                <div className="font-medium">{invoice.eventName}</div>
                {invoice.companyName && (
                  <div className="text-sm text-gray-500">{invoice.companyName}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {format(new Date(invoice.eventDate), 'MMM dd, yyyy')}
            </TableCell>
            <TableCell>
              <Badge variant={invoice.groupBy ? "default" : "secondary"}>
                {invoice.groupBy ? "Group" : "Single"}
              </Badge>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{invoice.contactName}</div>
                <div className="text-sm text-gray-500">{invoice.emailAddress}</div>
              </div>
            </TableCell>
            <TableCell>
              ${calculateTotal(invoice.services).toFixed(2)}
            </TableCell>
            <TableCell>
              {getStatusBadge(invoice.status, invoice.invoiceStatus)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}