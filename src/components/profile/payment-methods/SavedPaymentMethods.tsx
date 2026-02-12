
import React from "react";
import { CreditCard, Banknote, Receipt, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreditCard as CreditCardType, BankAccount, ACHDetails } from "@/types/profile";

interface SavedPaymentMethodsProps {
  savedCards: CreditCardType[];
  savedBankAccounts: BankAccount[];
  savedAchAccounts: ACHDetails[];
  onSetDefaultCard: (id: string) => void;
  onRemoveCard: (id: string) => void;
}

const SavedPaymentMethods = ({
  savedCards,
  savedBankAccounts,
  savedAchAccounts,
  onSetDefaultCard,
  onRemoveCard,
}: SavedPaymentMethodsProps) => {
  return (
    <div className="space-y-6">
      {savedCards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Saved Cards</h3>
          {savedCards.map((card) => (
            <div 
              key={card.id}
              className={`flex items-center justify-between p-4 border rounded-md ${card.isDefault ? 'border-[#F07712] bg-orange-50' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <CreditCard className="h-5 w-5 text-[#F07712]" />
                <div>
                  <p className="font-medium">{card.cardNumber}</p>
                  <p className="text-sm text-gray-500">
                    {card.cardholderName} • Expires {card.expiryMonth}/{card.expiryYear}
                  </p>
                </div>
                {card.isDefault && (
                  <span className="text-xs bg-[#F07712] text-white px-2 py-1 rounded-full">Default</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {!card.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSetDefaultCard(card.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveCard(card.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedBankAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Saved Bank Accounts</h3>
          {savedBankAccounts.map((account) => (
            <div 
              key={account.id}
              className={`flex items-center justify-between p-4 border rounded-md ${account.isDefault ? 'border-[#F07712] bg-orange-50' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <Banknote className="h-5 w-5 text-[#F07712]" />
                <div>
                  <p className="font-medium">{account.bankName}</p>
                  <p className="text-sm text-gray-500">
                    {account.accountName} • {account.accountType} • {account.accountNumber}
                  </p>
                </div>
                {account.isDefault && (
                  <span className="text-xs bg-[#F07712] text-white px-2 py-1 rounded-full">Default</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {savedAchAccounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Saved ACH Accounts</h3>
          {savedAchAccounts.map((account) => (
            <div 
              key={account.id}
              className={`flex items-center justify-between p-4 border rounded-md ${account.isDefault ? 'border-[#F07712] bg-orange-50' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <Receipt className="h-5 w-5 text-[#F07712]" />
                <div>
                  <p className="font-medium">{account.bankName}</p>
                  <p className="text-sm text-gray-500">
                    {account.accountName} • {account.accountType} • {account.accountNumber}
                  </p>
                </div>
                {account.isDefault && (
                  <span className="text-xs bg-[#F07712] text-white px-2 py-1 rounded-full">Default</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPaymentMethods;
