

import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface ThankYouCardProps {
  response: string;
  isTicketed?: boolean;
  foodSelection?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const ThankYouCard = ({ 
  response, 
  isTicketed, 
  foodSelection 
}: ThankYouCardProps) => {
  const isAttending = response === 'attending';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <h3 className="text-xl text-center font-bold">Thank You!</h3>
        <p className="text-center text-gray-500">
          Your response has been recorded.
        </p>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p>
          {isAttending
            ? "We look forward to seeing you at the event."
            : "We're sorry you can't make it, but thank you for letting us know."}
        </p>
        
        {isAttending && isTicketed && (
          <p className="text-sm text-gray-500">
            Please check your email for ticket information and payment instructions.
          </p>
        )}
        
        {foodSelection && foodSelection.length > 0 && (
          <div className="max-w-sm mx-auto bg-gray-50 p-4 rounded-lg mt-4 text-left">
            <h4 className="font-medium mb-2">Your Food Selection</h4>
            <div className="space-y-1">
              {foodSelection.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.quantity} x {item.name}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              
              <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between font-medium">
                <span>Total</span>
                <span>
                  {formatPrice(
                    foodSelection.reduce((total, item) => total + (item.price * item.quantity), 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThankYouCard;
