
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHODS } from '@/constants/payment-methods';

interface PaymentSettingsProps {
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
}

function PaymentSettings({ paymentMethod, onPaymentMethodChange }: PaymentSettingsProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">Payment Settings</label>
      <RadioGroup 
        value={paymentMethod} 
        onValueChange={onPaymentMethodChange}
        className="mt-2 space-y-3"
      >
        <div className="flex items-start space-x-2 border p-3 rounded-md">
          <RadioGroupItem value={PAYMENT_METHODS.HOST_PAYS} id="host-pays" />
          <div className="grid gap-1.5">
            <Label htmlFor="host-pays" className="font-medium">Host pays for everything</Label>
            <p className="text-sm text-gray-500">
              You will be charged for all guest orders upon approval
            </p>
          </div>
        </div>
        
        {/* <div className="flex items-start space-x-2 border p-3 rounded-md">
          <RadioGroupItem value={PAYMENT_METHODS.GUESTS_PAY} id="guests-pay" />
          <div className="grid gap-1.5">
            <Label htmlFor="guests-pay" className="font-medium">Guests pay individually</Label>
            <p className="text-sm text-gray-500">
              Each guest will pay for their own order at checkout
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-2 border p-3 rounded-md">
          <RadioGroupItem value={PAYMENT_METHODS.SPLIT_EQUALLY} id="split-equally" />
          <div className="grid gap-1.5">
            <Label htmlFor="split-equally" className="font-medium">Split equally between all guests</Label>
            <p className="text-sm text-gray-500">
              Total cost will be divided equally among all participants
            </p>
          </div>
        </div> */}
      </RadioGroup>
    </div>
  );
};

export default PaymentSettings;
