
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  dietary?: string[];
}

interface FoodSelectionProps {
  menuItems: MenuItem[];
  selectedItems: Array<{
    id: string;
    quantity: number;
  }>;
  onFoodSelect: (item: MenuItem, quantity: number) => void;
}

const FoodSelection = ({ 
  menuItems, 
  selectedItems, 
  onFoodSelect 
}: FoodSelectionProps) => {
  // Format price from cents to dollars
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };
  
  // Get quantity for a specific item
  const getQuantity = (itemId: string) => {
    const item = selectedItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  };
  
  // Group menu items by category if available
  const getMenuItemsByCategory = () => {
    const categorizedItems: Record<string, MenuItem[]> = {};
    
    menuItems.forEach(item => {
      const category = item.category || 'Main Menu';
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });
    
    return categorizedItems;
  };
  
  const categorizedMenuItems = getMenuItemsByCategory();
  const categories = Object.keys(categorizedMenuItems);
  
  // Calculate subtotal
  const subtotal = selectedItems.reduce((total, item) => {
    const menuItem = menuItems.find(m => m.id === item.id);
    return total + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);
  
  return (
    <div className="space-y-6">
      {/* Menu section */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <h3 className="font-semibold text-lg">{category}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorizedMenuItems[category].map((item) => {
                const quantity = getQuantity(item.id);
                
                return (
                  <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="flex flex-col h-full">
                        {item.image && (
                          <div className="w-full h-40">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <Label className="text-lg font-medium">{item.name}</Label>
                                {item.dietary && item.dietary.length > 0 && (
                                  <div className="flex flex-wrap mt-1 gap-1">
                                    {item.dietary.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-700 font-medium">{formatPrice(item.price)}</span>
                            </div>
                            
                            {item.description && (
                              <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          
                          <div className="flex justify-end items-center mt-4">
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => onFoodSelect(item, Math.max(0, quantity - 1))}
                                disabled={quantity === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <span className="w-6 text-center">{quantity}</span>
                              
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 rounded-full"
                                onClick={() => onFoodSelect(item, quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Order summary section */}
      {selectedItems.length > 0 && (
        <Card className="bg-gray-50">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Your Selection</h4>
              <span className="text-sm text-gray-500">{selectedItems.reduce((total, item) => total + item.quantity, 0)} items</span>
            </div>
            
            <div className="space-y-2">
              {selectedItems.map((item) => {
                const menuItem = menuItems.find(m => m.id === item.id);
                if (!menuItem) return null;
                
                const itemTotal = menuItem.price * item.quantity;
                
                return (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">{item.quantity} x </span>
                      <span className="ml-1">{menuItem.name}</span>
                    </div>
                    <span>{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodSelection;
