
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { GuestOrder } from "@/types/order";

interface GuestOrdersTableProps {
  guestOrders: GuestOrder[];
  calculateSubtotal: (items: GuestOrder['items']) => number;
}

const GuestOrdersTable = ({ guestOrders, calculateSubtotal }: GuestOrdersTableProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Guest Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guestOrders.map((guest, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{guest.name || guest.guestName}</TableCell>
                <TableCell>
                  {guest.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                </TableCell>
                <TableCell className="text-right">${calculateSubtotal(guest.items).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default GuestOrdersTable;
