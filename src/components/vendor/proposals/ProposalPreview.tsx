
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types/invoice-types';
import { format } from 'date-fns';
import { Share2, Download, Send, Phone, Building, Calendar, Clock } from 'lucide-react';

interface ProposalPreviewProps {
  proposal: Invoice;
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({ proposal }) => {
  const hasRequiredFields = 
    proposal.title && 
    proposal.clientName && 
    proposal.clientEmail && 
    proposal.clientPhone && 
    proposal.items.length > 0;

  if (!hasRequiredFields) {
    return (
      <div className="p-10 text-center bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Complete your proposal</h3>
        <p className="text-gray-500">
          Please fill in all required fields to preview your proposal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share Link
        </Button>
      </div>
      
      <Card className="border shadow-md max-w-4xl mx-auto">
        <CardContent className="p-0">
          {/* Beautiful header */}
          <div className="bg-gradient-to-r from-[#F07712] to-[#F59A59] p-8 text-white rounded-t-lg">
            <div className="flex justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Proposal</h2>
                <p className="text-white/80">{proposal.title}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold">${proposal.total.toFixed(2)}</p>
                <p className="text-white/80">Total</p>
              </div>
            </div>
          </div>
          
          {/* Proposal content */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Client</p>
                  <p className="font-semibold">{proposal.clientName}</p>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{proposal.clientEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-3.5 w-3.5 mr-1.5" />
                      <span>{proposal.clientPhone}</span>
                    </div>
                    {proposal.clientCompany && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-3.5 w-3.5 mr-1.5" />
                        <span>{proposal.clientCompany}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Service Details</p>
                  {proposal.serviceDate && (
                    <div className="flex items-center text-gray-800">
                      <Calendar className="h-4 w-4 mr-2 text-[#F07712]" />
                      <span className="font-medium">{format(proposal.serviceDate, 'PPP')}</span>
                    </div>
                  )}
                  
                  {proposal.serviceTime && (
                    <div className="flex items-center text-gray-800 mt-1">
                      <Clock className="h-4 w-4 mr-2 text-[#F07712]" />
                      <span>{proposal.serviceTime}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-gray-500 text-sm mb-1">Expiry Date</p>
                  <p>{proposal.expiryDate ? format(proposal.expiryDate, 'PPP') : 'Not specified'}</p>
                </div>
              </div>
            </div>
            
            {proposal.message && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{proposal.message}</p>
              </div>
            )}

            {proposal.deliveryNotes && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Delivery Notes:</p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">{proposal.deliveryNotes}</p>
                </div>
              </div>
            )}
            
            <div>
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-gray-500">
                    <th className="py-3 px-2">Service</th>
                    <th className="py-3 px-2 text-center">Qty</th>
                    <th className="py-3 px-2 text-center">Price</th>
                    <th className="py-3 px-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items.map((item, index) => (
                    <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-4 px-2">
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center">{item.quantity}</td>
                      <td className="py-4 px-2 text-center">${item.price.toFixed(2)}</td>
                      <td className="py-4 px-2 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal</span>
                  <span>${proposal.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span>${proposal.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-6">
              <Button className="w-full md:w-auto bg-[#F07712] hover:bg-[#F07712]/90">
                <Send className="mr-2 h-4 w-4" />
                Accept & Pay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
