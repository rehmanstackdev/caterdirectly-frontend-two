
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { bankAccountFormSchema } from "./schemas/bank-account-schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BankAccountFormFieldsProps {
  form: UseFormReturn<z.infer<typeof bankAccountFormSchema>>;
}

const BankAccountFormFields = ({ form }: BankAccountFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="accountName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Holder Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bankName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Name</FormLabel>
            <FormControl>
              <Input placeholder="Chase Bank" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="checking">Checking</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="routingNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Routing Number</FormLabel>
            <FormControl>
              <Input placeholder="123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="accountNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Number</FormLabel>
            <FormControl>
              <Input placeholder="•••• •••• •••• 1234" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BankAccountFormFields;

