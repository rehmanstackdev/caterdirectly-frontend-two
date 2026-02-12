
import React from 'react';
import { Invoice } from '@/types/invoice-types';
import { format } from 'date-fns';
import { Phone, Building, Calendar, Clock } from 'lucide-react';

interface ProposalClientViewProps {
  proposal: Invoice;
}

export const ProposalClientView: React.FC<ProposalClientViewProps> = ({ proposal }) => {
  return (
    <div className="p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{proposal.title}</h2>
            {proposal.message && (
              <p className="text-gray-600 mt-2">{proposal.message}</p>
            )}
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Client Information</p>
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
            <p className="text-gray-500 text-sm mb-1">Proposal Sent By</p>
            <p className="font-semibold">{proposal.vendorName}</p>
            <p className="text-sm text-gray-600">
              Expires on {proposal.expiryDate ? format(proposal.expiryDate, 'PPP') : 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {proposal.deliveryNotes && (
        <div className="mb-8">
          <p className="font-medium text-gray-700 mb-2">Delivery & Setup Notes:</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-gray-700">{proposal.deliveryNotes}</p>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Services & Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-500">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-center">Price</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {proposal.items.map((item, index) => (
                <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                  <td className="py-4 px-4">
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-center">${item.price.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right">${item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 border-t pt-4 flex flex-col items-end">
          <div className="flex justify-between w-full max-w-xs py-2">
            <span className="font-medium">Subtotal</span>
            <span>${proposal.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full max-w-xs py-2 text-lg font-bold">
            <span>Total</span>
            <span>${proposal.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
