import React, { useState } from "react";
import { DollarSign, Download, Search, Filter, ArrowUp, ArrowDown, Wallet, Clock, UserPlus, BarChart2, FileText } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import invoiceService from "@/services/api/admin/invoice.service";

// Mock transaction data
const mockTransactions = [
  {
    id: "TXN-789042",
    date: "2025-04-29T10:30:00Z",
    type: "payment",
    description: "Booking payment - Gourmet Delights",
    amount: 1250.00,
    status: "completed",
    vendor: "Gourmet Delights",
    customer: "John Smith",
    paymentMethod: "Credit Card",
  },
  {
    id: "TXN-789041",
    date: "2025-04-28T15:45:00Z",
    type: "refund",
    description: "Refund for cancelled event",
    amount: -750.00,
    status: "completed",
    vendor: "Elite Bartenders",
    customer: "Sarah Johnson",
    paymentMethod: "Credit Card",
  },
  {
    id: "TXN-789040",
    date: "2025-04-28T09:15:00Z",
    type: "payout",
    description: "Weekly vendor payout - Luxury Venues",
    amount: -4250.00,
    status: "completed",
    vendor: "Luxury Venues",
    customer: "System",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "TXN-789039",
    date: "2025-04-27T16:20:00Z",
    type: "payment",
    description: "Group booking - Party Equipment Pro",
    amount: 3800.00,
    status: "completed",
    vendor: "Party Equipment Pro",
    customer: "Michael Brown",
    paymentMethod: "PayPal",
  },
  {
    id: "TXN-789038",
    date: "2025-04-27T13:10:00Z",
    type: "payment",
    description: "Event booking - Luxury Venues",
    amount: 5650.00,
    status: "processing",
    vendor: "Luxury Venues",
    customer: "Emily Davis",
    paymentMethod: "Credit Card",
  },
  {
    id: "TXN-789037",
    date: "2025-04-26T11:40:00Z",
    type: "payout",
    description: "Weekly vendor payout - Elite Catering Co.",
    amount: -2850.00,
    status: "failed",
    vendor: "Elite Catering Co.",
    customer: "System",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "TXN-789036",
    date: "2025-04-26T09:25:00Z",
    type: "payment",
    description: "Service booking - Elite Bartenders",
    amount: 950.00,
    status: "completed",
    vendor: "Elite Bartenders",
    customer: "David Wilson",
    paymentMethod: "Credit Card",
  }
];

// Mock revenue data for charts
const mockRevenueData = {
  daily: [
    { date: "Apr 23", revenue: 5800 },
    { date: "Apr 24", revenue: 6200 },
    { date: "Apr 25", revenue: 7500 },
    { date: "Apr 26", revenue: 8100 },
    { date: "Apr 27", revenue: 9450 },
    { date: "Apr 28", revenue: 8700 },
    { date: "Apr 29", revenue: 9200 }
  ],
  
  monthly: [
    { date: "Nov", revenue: 175000 },
    { date: "Dec", revenue: 195000 },
    { date: "Jan", revenue: 165000 },
    { date: "Feb", revenue: 184000 },
    { date: "Mar", revenue: 215000 },
    { date: "Apr", revenue: 252000 }
  ]
};

const FinancialStatCard = ({ title, amount, percentage, trend }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {percentage}%
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">{amount}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

function FinanceManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [invoices, setInvoices] = useState([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2025, 3, 23), // April 23, 2025
    to: new Date(2025, 3, 29), // April 29, 2025
  });

  // Load invoices on component mount
  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoadingInvoices(true);
      try {
        // Note: Add getInvoices method to invoice service if needed
        // const invoiceData = await invoiceService.getInvoices();
        // setInvoices(invoiceData);
      } catch (error) {
        console.error('Failed to load invoices:', error);
      } finally {
        setIsLoadingInvoices(false);
      }
    };
    loadInvoices();
  }, []);
  
  // Filter transactions based on search and filters
  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals
  const calculateTotal = (type: string) => {
    if (type === "revenue") {
      return mockTransactions
        .filter(tx => tx.type === "payment" && tx.status === "completed")
        .reduce((sum, tx) => sum + tx.amount, 0);
    }
    if (type === "payouts") {
      return Math.abs(mockTransactions
        .filter(tx => tx.type === "payout" && tx.status === "completed")
        .reduce((sum, tx) => sum + tx.amount, 0));
    }
    if (type === "refunds") {
      return Math.abs(mockTransactions
        .filter(tx => tx.type === "refund" && tx.status === "completed")
        .reduce((sum, tx) => sum + tx.amount, 0));
    }
    return 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };
  
  // Get transaction type badge color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "payment":
        return "bg-green-100 text-green-800";
      case "refund":
        return "bg-amber-100 text-amber-800";
      case "payout":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get transaction status badge color
  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dashboard userRole="super-admin" activeTab="finance">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Finance & Payments</h1>
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(calculateTotal("revenue"))}</p>
                  <p className="text-sm text-green-600 mt-1">+12% from last week</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Vendor Payouts</p>
                  <p className="text-3xl font-bold">{formatCurrency(calculateTotal("payouts"))}</p>
                  <p className="text-sm text-amber-600 mt-1">+8% from last week</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Transactions</p>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-sm text-amber-600 mt-1">-3 from yesterday</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100 text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Refund Amount</p>
                  <p className="text-3xl font-bold">{formatCurrency(calculateTotal("refunds"))}</p>
                  <p className="text-sm text-red-600 mt-1">+2.5% from last week</p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <ArrowDown className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              className="pl-10"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-[140px]">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="payout">Payouts</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-[140px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="transactions">
          <TabsList className="mb-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Vendor Payouts</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Transaction History</CardTitle>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" /> Advanced Filters
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono">{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <Badge className={getTransactionTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                        <TableCell>{transaction.vendor}</TableCell>
                        <TableCell>{transaction.customer}</TableCell>
                        <TableCell className={transaction.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {transaction.amount > 0 ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTransactionStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="payouts">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <Wallet className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">Vendor Payout Management</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  This module will provide tools to manage vendor payouts, set payout schedules, and track payment history.
                </p>
                <Button className="mt-4">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Payouts
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="invoices">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">Invoice Management</CardTitle>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Create Invoice
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingInvoices ? (
                  <div className="flex items-center justify-center h-[200px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading invoices...</p>
                    </div>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="flex items-center justify-center h-[200px] border border-dashed rounded-md">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                      <p className="text-gray-500 text-sm">
                        Invoices will appear here when created through bookings and group orders.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Event Name</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono">{invoice.id}</TableCell>
                          <TableCell>{invoice.eventName}</TableCell>
                          <TableCell>{invoice.contactName}</TableCell>
                          <TableCell className="font-medium">${invoice.totalAmount}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">
                              {invoice.status || 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>{invoice.createdAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="flex items-center justify-center h-[400px] border border-dashed rounded-md">
              <div className="text-center">
                <BarChart2 className="h-16 w-16 mx-auto text-gray-300" />
                <h2 className="mt-4 text-xl">Financial Reports</h2>
                <p className="mt-2 text-gray-500 max-w-md">
                  This module will provide comprehensive financial reporting tools including revenue analytics, expense tracking, and tax reports.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Dashboard>
  );
};

export default FinanceManagement;
