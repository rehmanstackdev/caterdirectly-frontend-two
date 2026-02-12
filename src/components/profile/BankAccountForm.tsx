
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { bankAccountFormSchema } from "./payment-methods/schemas/bank-account-schema";
import BankAccountFormFields from "./payment-methods/BankAccountFormFields";

interface BankAccountFormProps {
  type: "bank" | "ach";
  onSubmit: (values: z.infer<typeof bankAccountFormSchema>) => void;
}

const BankAccountForm = ({ type, onSubmit }: BankAccountFormProps) => {
  const form = useForm<z.infer<typeof bankAccountFormSchema>>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: {
      accountName: "",
      bankName: "",
      accountType: "checking",
      routingNumber: "",
      accountNumber: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BankAccountFormFields form={form} />
        <DialogFooter>
          <Button type="submit">
            {type === "bank" ? "Add Bank Account" : "Add ACH Account"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default BankAccountForm;

