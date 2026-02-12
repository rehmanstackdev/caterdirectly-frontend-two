import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Line,
  Bar,
  BarChart,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DollarSign, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Example monthly revenue data
const monthlyData = [
  { month: 'Jan', revenue: 2500, commissions: 375, received: 2125 },
  { month: 'Feb', revenue: 3200, commissions: 480, received: 2720 },
  { month: 'Mar', revenue: 4100, commissions: 615, received: 3485 },
  { month: 'Apr', revenue: 3800, commissions: 570, received: 3230 },
  { month: 'May', revenue: 5600, commissions: 840, received: 4760 },
  { month: 'Jun', revenue: 4900, commissions: 735, received: 4165 },
  { month: 'Jul', revenue: 6100, commissions: 915, received: 5185 },
  { month: 'Aug', revenue: 7500, commissions: 1125, received: 6375 },
  { month: 'Sep', revenue: 6800, commissions: 1020, received: 5780 },
  { month: 'Oct', revenue: 8200, commissions: 1230, received: 6970 },
  { month: 'Nov', revenue: 7300, commissions: 1095, received: 6205 },
  { month: 'Dec', revenue: 10200, commissions: 1530, received: 8670 }
];

// Example payout history
const payoutHistory = [
  { id: 'PO1234', date: '2025-04-28', amount: '$2,345.75', status: 'completed' },
  { id: 'PO1233', date: '2025-04-15', amount: '$1,870.28', status: 'completed' },
  { id: 'PO1232', date: '2025-03-31', amount: '$3,105.50', status: 'completed' },
  { id: 'PO1231', date: '2025-03-15', amount: '$2,721.18', status: 'completed' },
  { id: 'PO1230', date: '2025-02-28', amount: '$1,958.33', status: 'completed' }
];

// Example invoices
const invoices = [
  { id: 'INV2345', date: '2025-04-28', customer: 'Tech Startup Inc.', amount: '$1,200.00', status: 'paid' },
  { id: 'INV2344', date: '2025-04-25', customer: 'Agency Partners', amount: '$1,850.00', status: 'paid' },
  { id: 'INV2343', date: '2025-04-15', customer: 'Marketing Summit', amount: '$2,300.00', status: 'paid' },
  { id: 'INV2342', date: '2025-04-10', customer: 'Design Conference', amount: '$750.00', status: 'pending' },
  { id: 'INV2341', date: '2025-04-05', customer: 'Community Event', amount: '$1,100.00', status: 'paid' }
];

const FinancialDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-3xl font-bold">$8,475.50</p>
                <p className="text-xs text-gray-500">Last payout: Apr 15, 2025</p>
              </div>
              <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
                <DollarSign className="h-6 w-6 text-[rgba(240,119,18,1)]" />
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-[#F07712] hover:bg-[#F07712]/90"
            >
              Request Payout
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Revenue</p>
                <p className="text-3xl font-bold">$10,200.00</p>
                <p className="text-xs text-green-600">↑ 24% from last month</p>
              </div>
              <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
                <TrendingUp className="h-6 w-6 text-[rgba(240,119,18,1)]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Platform Fee</p>
                <p className="text-3xl font-bold">$1,530.00</p>
                <p className="text-xs text-gray-500">15% commission rate</p>
              </div>
              <div className="p-3 rounded-full bg-[rgba(240,119,18,0.1)]">
                <FileText className="h-6 w-6 text-[rgba(240,119,18,1)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="earnings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="taxes">Tax Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>View your earnings over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#F07712" name="Total Revenue" strokeWidth={2} />
                    <Line type="monotone" dataKey="received" stroke="#65a30d" name="Your Earnings" strokeWidth={2} />
                    <Line type="monotone" dataKey="commissions" stroke="#dc2626" name="Platform Fees" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-500">Total Revenue YTD</p>
                  <p className="text-2xl font-bold">$70,200.00</p>
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-500">Your Earnings YTD</p>
                  <p className="text-2xl font-bold">$59,670.00</p>
                </div>
                <div className="border rounded p-4">
                  <p className="text-sm text-gray-500">Platform Fees YTD</p>
                  <p className="text-2xl font-bold">$10,530.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>View your past payouts and pending requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Payout ID</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutHistory.map((payout) => (
                      <tr key={payout.id} className="border-b">
                        <td className="px-4 py-3">{payout.id}</td>
                        <td className="px-4 py-3">{payout.date}</td>
                        <td className="px-4 py-3 font-semibold">{payout.amount}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-green-100 text-green-800">
                            {payout.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" size="sm">Details</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  Payouts are typically processed within 3-5 business days after request.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Manage your invoices and payment records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Invoice ID</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b">
                        <td className="px-4 py-3">{invoice.id}</td>
                        <td className="px-4 py-3">{invoice.date}</td>
                        <td className="px-4 py-3">{invoice.customer}</td>
                        <td className="px-4 py-3 font-semibold">{invoice.amount}</td>
                        <td className="px-4 py-3">
                          <Badge 
                            className={invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing 5 of 24 invoices
                </p>
                <Button variant="outline">
                  View All Invoices
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="taxes">
          <Card>
            <CardHeader>
              <CardTitle>Tax Reports</CardTitle>
              <CardDescription>Download your tax documents and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <FileText className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Tax Report Generation</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  Generate and download tax reports for your vendor account based on selected year.
                </p>
                
                <div className="mt-6 flex justify-center">
                  <div className="border rounded-lg p-6 w-full max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Tax Year
                    </label>
                    <select className="border rounded-md p-2 w-full mb-4">
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                    
                    <Button className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Tax Report
                    </Button>
                    
                    <Separator className="my-4" />
                    
                    <h4 className="font-medium mb-2">Previously Generated Reports</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span>2024 Annual Tax Report</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          <span>2023 Annual Tax Report</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
