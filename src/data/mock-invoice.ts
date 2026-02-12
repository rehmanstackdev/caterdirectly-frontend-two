
import { Invoice } from '@/types/invoice-types';

export const mockInvoice: Invoice = {
  id: "invoice-1",
  title: "Wedding Catering Package",
  clientName: "John & Sarah Smith",
  clientEmail: "john.smith@example.com",
  clientPhone: "(555) 123-4567",
  clientCompany: "Smith Family Events",
  vendorName: "Gourmet Delights Catering",
  message: "Thank you for considering our catering services for your special day! This invoice includes all the items we discussed during our meeting. Please review and let me know if you have any questions or would like any adjustments.",
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  serviceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  serviceTime: "5:00 PM - 11:00 PM",
  deliveryNotes: "Please ensure that the venue's loading dock is accessible from 2:00 PM for setup. We'll need access to a kitchen for final preparations.",
  items: [
    {
      id: "item-1",
      serviceId: "1",
      name: "Full-Service Buffet",
      description: "Complete buffet service including setup, service staff, and cleanup. Serves 100 guests.",
      price: 65,
      quantity: 100,
      total: 6500
    },
    {
      id: "item-2",
      serviceId: "2",
      name: "Premium Bar Service",
      description: "4-hour premium open bar with signature cocktails and professional bartenders.",
      price: 35,
      quantity: 100,
      total: 3500
    },
    {
      id: "item-3",
      serviceId: "3",
      name: "Wedding Cake",
      description: "Three-tier custom wedding cake with your choice of flavors and decorations.",
      price: 500,
      quantity: 1,
      total: 500
    }
  ],
  total: 10500, // 6500 + 3500 + 500
  status: "sent",
  createdAt: new Date(),
  updatedAt: new Date()
};
