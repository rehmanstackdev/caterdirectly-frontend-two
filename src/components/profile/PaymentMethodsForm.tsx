
import React, { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethods } from "@/types/profile";
import PaymentMethodSelection from "./payment-methods/PaymentMethodSelection";
import SavedPaymentMethods from "./payment-methods/SavedPaymentMethods";
import NetTermsStatus from "./payment-methods/NetTermsStatus";
import AddCardDialog from "./payment-methods/AddCardDialog";
import NetTermsDialog from "./payment-methods/NetTermsDialog";
import BankAccountForm from "./BankAccountForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cardFormSchema, netTermsFormSchema } from "./payment-methods/schemas";

interface PaymentMethodsFormProps {
  initialData?: PaymentMethods;
}

const PaymentMethodsForm = ({ initialData }: PaymentMethodsFormProps) => {
  const { toast } = useToast();
  const [savedCards, setSavedCards] = useState(initialData?.creditCards || []);
  const [savedBankAccounts, setSavedBankAccounts] = useState(initialData?.bankAccounts || []);
  const [savedAchAccounts, setSavedAchAccounts] = useState(initialData?.achAccounts || []);
  const [hasNetTerms, setHasNetTerms] = useState(initialData?.hasNetTerms || false);
  const [netTermsApplicationStatus, setNetTermsApplicationStatus] = useState(initialData?.netTermsStatus || "not_applied");
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [showAddBankDialog, setShowAddBankDialog] = useState(false);
  const [showAddAchDialog, setShowAddAchDialog] = useState(false);
  const [showNetTermsDialog, setShowNetTermsDialog] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethods["defaultMethod"]>(initialData?.defaultMethod || "card");

  function onSubmitCardForm(values: z.infer<typeof cardFormSchema>) {
    const last4 = values.cardNumber.slice(-4);
    const maskedNumber = `•••• •••• •••• ${last4}`;
    
    const newCard = {
      id: Date.now().toString(),
      cardholderName: values.cardholderName,
      cardNumber: maskedNumber,
      expiryMonth: values.expiryMonth,
      expiryYear: values.expiryYear,
      isDefault: savedCards.length === 0,
    };
    
    setSavedCards([...savedCards, newCard]);
    setShowAddCardDialog(false);
    
    toast({
      title: "Card added",
      description: "Your payment card has been added successfully.",
    });
  }

  function onSubmitNetTermsForm(values: z.infer<typeof netTermsFormSchema>) {
    setHasNetTerms(true);
    setNetTermsApplicationStatus("pending");
    setShowNetTermsDialog(false);
    
    toast({
      title: "NET Terms Application Submitted",
      description: "Your application for NET payment terms is under review.",
    });
  }

  function removeCard(id: string) {
    setSavedCards(savedCards.filter(card => card.id !== id));
    
    toast({
      title: "Card removed",
      description: "Your payment card has been removed.",
    });
  }

  function setDefaultCard(id: string) {
    setSavedCards(savedCards.map(card => ({
      ...card,
      isDefault: card.id === id,
    })));
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been updated.",
    });
  }

  const handleBankAccountSubmit = (values: any) => {
    const newBankAccount = {
      id: Date.now().toString(),
      ...values,
      accountNumber: `••••••••${values.accountNumber.slice(-4)}`,
      routingNumber: `•••••••${values.routingNumber.slice(-3)}`,
      isDefault: savedBankAccounts.length === 0,
    };

    setSavedBankAccounts([...savedBankAccounts, newBankAccount]);
    setShowAddBankDialog(false);
    toast({
      title: "Bank account added",
      description: "Your bank account has been added successfully.",
    });
  };

  const handleAchSubmit = (values: any) => {
    const newAchAccount = {
      id: Date.now().toString(),
      ...values,
      accountNumber: `••••••••${values.accountNumber.slice(-4)}`,
      routingNumber: `•••••••${values.routingNumber.slice(-3)}`,
      isDefault: savedAchAccounts.length === 0,
    };

    setSavedAchAccounts([...savedAchAccounts, newAchAccount]);
    setShowAddAchDialog(false);
    toast({
      title: "ACH account added",
      description: "Your ACH account has been added successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodSelection
            selectedPaymentMethod={selectedPaymentMethod}
            hasNetTerms={hasNetTerms}
            netTermsApplicationStatus={netTermsApplicationStatus}
            onMethodChange={setSelectedPaymentMethod}
            onAddCard={() => setShowAddCardDialog(true)}
            onAddBank={() => setShowAddBankDialog(true)}
            onAddAch={() => setShowAddAchDialog(true)}
            onApplyNetTerms={() => setShowNetTermsDialog(true)}
          />

          <NetTermsStatus 
            status={netTermsApplicationStatus}
            terms={initialData?.netTerms?.paymentTerms}
          />

          <SavedPaymentMethods
            savedCards={savedCards}
            savedBankAccounts={savedBankAccounts}
            savedAchAccounts={savedAchAccounts}
            onSetDefaultCard={setDefaultCard}
            onRemoveCard={removeCard}
          />
        </CardContent>
      </Card>

      <AddCardDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onSubmit={onSubmitCardForm}
      />

      <NetTermsDialog
        open={showNetTermsDialog}
        onOpenChange={setShowNetTermsDialog}
        onSubmit={onSubmitNetTermsForm}
      />

      <Dialog open={showAddBankDialog} onOpenChange={setShowAddBankDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account to your payment methods
            </DialogDescription>
          </DialogHeader>
          <BankAccountForm type="bank" onSubmit={handleBankAccountSubmit} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAchDialog} onOpenChange={setShowAddAchDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add ACH Account</DialogTitle>
            <DialogDescription>
              Add a new ACH direct debit account
            </DialogDescription>
          </DialogHeader>
          <BankAccountForm type="ach" onSubmit={handleAchSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentMethodsForm;
