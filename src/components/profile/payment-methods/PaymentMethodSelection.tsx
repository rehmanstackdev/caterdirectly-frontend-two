
import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Building, Banknote, Receipt } from "lucide-react";
import { PaymentMethods } from "@/types/profile";

interface PaymentMethodSelectionProps {
  selectedPaymentMethod: PaymentMethods["defaultMethod"];
  hasNetTerms: boolean;
  netTermsApplicationStatus: string;
  onMethodChange: (value: PaymentMethods["defaultMethod"]) => void;
  onAddCard: () => void;
  onAddBank: () => void;
  onAddAch: () => void;
  onApplyNetTerms: () => void;
}

const PaymentMethodSelection = ({
  selectedPaymentMethod,
  hasNetTerms,
  netTermsApplicationStatus,
  onMethodChange,
  onAddCard,
  onAddBank,
  onAddAch,
  onApplyNetTerms,
}: PaymentMethodSelectionProps) => {
  return (
    <RadioGroup
      value={selectedPaymentMethod}
      className="space-y-4"
      onValueChange={(value: string) => {
        if (value === "card" || value === "bank_account" || value === "ach" || value === "net_terms") {
          onMethodChange(value as PaymentMethods["defaultMethod"]);
        }
      }}
    >
      <Label className="text-base">Select Default Payment Method</Label>
      <div className="space-y-4">
        <div className={`flex items-center space-x-2 border rounded-md p-4 ${selectedPaymentMethod === "card" ? "border-[#F07712] bg-orange-50" : ""}`}>
          <RadioGroupItem value="card" id="card" />
          <label htmlFor="card" className="flex items-center space-x-2 font-medium cursor-pointer flex-1">
            <CreditCard className="h-5 w-5 text-[#F07712]" />
            <span>Credit/Debit Card</span>
          </label>
          <Button variant="outline" size="sm" onClick={onAddCard}>
            Add Card
          </Button>
        </div>

        <div className={`flex items-center space-x-2 border rounded-md p-4 ${selectedPaymentMethod === "bank_account" ? "border-[#F07712] bg-orange-50" : ""}`}>
          <RadioGroupItem value="bank_account" id="bank_account" />
          <label htmlFor="bank_account" className="flex items-center space-x-2 font-medium cursor-pointer flex-1">
            <Banknote className="h-5 w-5 text-[#F07712]" />
            <span>Bank Account</span>
          </label>
          <Button variant="outline" size="sm" onClick={onAddBank}>
            Add Bank Account
          </Button>
        </div>

        <div className={`flex items-center space-x-2 border rounded-md p-4 ${selectedPaymentMethod === "ach" ? "border-[#F07712] bg-orange-50" : ""}`}>
          <RadioGroupItem value="ach" id="ach" />
          <label htmlFor="ach" className="flex items-center space-x-2 font-medium cursor-pointer flex-1">
            <Receipt className="h-5 w-5 text-[#F07712]" />
            <span>ACH Direct Debit</span>
          </label>
          <Button variant="outline" size="sm" onClick={onAddAch}>
            Add ACH Account
          </Button>
        </div>

        <div className={`flex items-center space-x-2 border rounded-md p-4 ${selectedPaymentMethod === "net_terms" ? "border-[#F07712] bg-orange-50" : ""}`}>
          <RadioGroupItem value="net_terms" id="net_terms" disabled={!hasNetTerms || netTermsApplicationStatus !== "approved"} />
          <label htmlFor="net_terms" className="flex items-center space-x-2 font-medium cursor-pointer flex-1">
            <Building className="h-5 w-5 text-[#F07712]" />
            <span>NET Terms</span>
          </label>
          {!hasNetTerms && (
            <Button variant="outline" size="sm" onClick={onApplyNetTerms}>
              Apply
            </Button>
          )}
        </div>
      </div>
    </RadioGroup>
  );
};

export default PaymentMethodSelection;
