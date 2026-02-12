
import { ShoppingBag, FileText, Eye } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import invoiceService from "@/services/api/admin/invoice.service";
import React, { useState, useEffect } from "react";

// Mock orders data
const mockOrders = [
  {
    id: "ORD-001",
    eventName: "Corporate Meeting",
    clientName: "John Smith",
    eventDate: "2025-05-15",
    status: "confirmed",
    totalAmount: 1250.00,
    hasInvoice: true
  },
  {
    id: "ORD-002",
    eventName: "Birthday Party",
    clientName: "Sarah Johnson",
    eventDate: "2025-05-20",
    status: "pending",
    totalAmount: 850.00,
    hasInvoice: false
  }
];

function OrderManagement() {
  const [orders, setOrders] = useState(mockOrders);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState<string | null>(null);

  const handleCreateInvoice = async (order: any) => {
    setIsCreatingInvoice(order.id);
    try {
      const invoiceData = {
        eventName: order.eventName,
        companyName: '',
        eventLocation: '',
        eventDate: order.eventDate,
        serviceTime: '',
        guestCount: 1,
        contactName: order.clientName,
        phoneNumber: '',
        emailAddress: '',
        addBackupContact: false,
        additionalNotes: '',
        taxExemptStatus: false,
        waiveServiceFee: false,
        budgetPerPerson: 0,
        budget: order.totalAmount,
        selectItem: '',
        quantity: 1,
        orderDeadline: order.eventDate,
        inviteFriends: [],
        paymentSettings: 'credit_card',
        services: [],
        customLineItems: []
      };
      
      await invoiceService.createInvoice(invoiceData);
      
      // Update order to show it has an invoice
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, hasInvoice: true } : o
      ));
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setIsCreatingInvoice(null);
    }
  };

  return (
    <Dashboard userRole="super-admin" activeTab="orders">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Orders & Bookings Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>{order.eventName}</TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell>{order.eventDate}</TableCell>
                    <TableCell className="font-medium">${order.totalAmount}</TableCell>
                    <TableCell>
                      <Badge className={order.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.hasInvoice ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3 mr-1" />
                          Created
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Not Created
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {!order.hasInvoice && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCreateInvoice(order)}
                            disabled={isCreatingInvoice === order.id}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            {isCreatingInvoice === order.id ? 'Creating...' : 'Create Invoice'}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
};

export default OrderManagement;
