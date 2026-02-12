
import { useState, useEffect } from 'react';
import { MenuItem, ComboCategory, ComboItem } from '@/types/service-types';
import { ComboSelections } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import ServiceImage from '@/components/shared/ServiceImage';
import { getCategoryBehavior, calculateComboTotal, ComboCalculationResult } from '@/utils/combo-calculations';
import CompactQuantityControls from '@/components/ui/CompactQuantityControls';

interface ComboSelectionFormProps {
  comboItem: MenuItem;
  onAddToOrder: (selections: ComboSelections) => void;
  onCancel: () => void;
  headcount?: number; // For calculating sides/toppings
}

// Helper to normalize premium prices (handles strings like "$1.50")
const normalizePrice = (value: any): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

const ComboSelectionForm = ({
  comboItem,
  onAddToOrder,
  onCancel,
  headcount = 1
}: ComboSelectionFormProps) => {
  const [selections, setSelections] = useState<ComboSelections>({
    comboItemId: comboItem.id,
    comboName: comboItem.name,
    basePrice: comboItem.price,
    selections: [],
    totalPrice: comboItem.price,
    headcount
  });

  // Initialize selections structure
  useEffect(() => {
    if (comboItem.comboCategories) {
      const initialSelections = comboItem.comboCategories.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        selectedItems: []
      }));
      
      setSelections(prev => ({
        ...prev,
        selections: initialSelections
      }));
    }
  }, [comboItem]);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Calculate total protein quantity
  const calculateTotalProteinQuantity = (): number => {
    let total = 0;
    selections.selections.forEach(catSelection => {
      const category = comboItem.comboCategories?.find(c => c.id === catSelection.categoryId);
      if (category && getCategoryBehavior(category).isProtein) {
        catSelection.selectedItems.forEach(item => {
          total += item.quantity || 0;
        });
      }
    });
    return total;
  };

  const totalProteinQuantity = calculateTotalProteinQuantity();
  const hasProteinSelection = totalProteinQuantity > 0;

  // State for calculation breakdown
  const [calculationBreakdown, setCalculationBreakdown] = useState<ComboCalculationResult | null>(null);

  // Calculate price with selections using combo logic
  useEffect(() => {
    const calculation = calculateComboTotal(
      comboItem.price,
      selections.selections,
      totalProteinQuantity || 1
    );
    
    setCalculationBreakdown(calculation);
    setSelections(prev => ({
      ...prev,
      totalPrice: calculation.totalPrice
    }));
  }, [selections.selections, totalProteinQuantity, comboItem.price]);

  // Handle single selection (radio button)
  const handleSingleSelection = (categoryId: string, item: ComboItem) => {
    const category = comboItem.comboCategories?.find(cat => cat.id === categoryId);
    const isProtein = category ? getCategoryBehavior(category).isProtein : false;
    
    setSelections(prev => ({
      ...prev,
      selections: prev.selections.map(catSelection => {
        if (catSelection.categoryId === categoryId) {
          return {
            ...catSelection,
            selectedItems: [{
              itemId: item.id,
              itemName: item.name,
              additionalPrice: normalizePrice(item.additionalPrice),
              quantity: isProtein ? 1 : undefined, // Default quantity for proteins
              price: item.price || 0
            }]
          };
        }
        return catSelection;
      })
    }));
  };

  // Get current quantity for an item (for display purposes)
  const getCurrentQuantity = (categoryId: string, itemId: string): number => {
    const catSelection = selections.selections.find(s => s.categoryId === categoryId);
    const item = catSelection?.selectedItems.find(i => i.itemId === itemId);
    return item?.quantity || 0;
  };

  // Handle multiple selection (checkboxes) 
  const handleMultiSelection = (categoryId: string, item: ComboItem, isSelected: boolean) => {
    const category = comboItem.comboCategories?.find(cat => cat.id === categoryId);
    const isProtein = category ? getCategoryBehavior(category).isProtein : false;
    
    if (isProtein) {
      // For proteins, use quantity-based selection (0 = unselected, 1+ = selected)
      handleQuantityChange(categoryId, item.id, isSelected ? 1 : 0);
      return;
    }
    
    setSelections(prev => ({
      ...prev,
      selections: prev.selections.map(catSelection => {
        if (catSelection.categoryId === categoryId) {
          let selectedItems = [...catSelection.selectedItems];
          
          if (isSelected) {
            // Add item if not already selected and if there's room
            if (!selectedItems.some(i => i.itemId === item.id) && 
                selectedItems.length < (category?.maxSelections || 1)) {
              selectedItems.push({
                itemId: item.id,
                itemName: item.name,
                additionalPrice: normalizePrice(item.additionalPrice),
                quantity: undefined, // No quantity for non-proteins
                price: item.price || 0
              });
            }
          } else {
            // Remove item
            selectedItems = selectedItems.filter(i => i.itemId !== item.id);
          }
          
          return {
            ...catSelection,
            selectedItems
          };
        }
        return catSelection;
      })
    }));
  };

  // Handle quantity change for protein items
  const handleQuantityChange = (categoryId: string, itemId: string, newQuantity: number) => {
    const category = comboItem.comboCategories?.find(cat => cat.id === categoryId);
    if (!category) return;
    
    setSelections(prev => ({
      ...prev,
      selections: prev.selections.map(catSelection => {
        if (catSelection.categoryId === categoryId) {
          let selectedItems = [...catSelection.selectedItems];
          const existingItemIndex = selectedItems.findIndex(item => item.itemId === itemId);
          const item = category.items.find(i => i.id === itemId);
          
          if (newQuantity === 0) {
            // Remove item when quantity is 0
            if (existingItemIndex >= 0) {
              selectedItems.splice(existingItemIndex, 1);
            }
          } else {
            // Add or update item when quantity > 0
            if (existingItemIndex >= 0) {
              // Update existing item quantity
              selectedItems[existingItemIndex] = {
                ...selectedItems[existingItemIndex],
                quantity: newQuantity
              };
            } else if (item && selectedItems.length < category.maxSelections) {
              // Add new item with quantity
              selectedItems.push({
                itemId: item.id,
                itemName: item.name,
                additionalPrice: normalizePrice(item.additionalPrice),
                quantity: newQuantity,
                price: item.price || 0
              });
            }
          }
          
          return {
            ...catSelection,
            selectedItems
          };
        }
        return catSelection;
      })
    }));
  };

  const isSelectionComplete = () => {
    if (!comboItem.comboCategories) return false;
    
    return comboItem.comboCategories.every(category => {
      const catSelection = selections.selections.find(s => s.categoryId === category.id);
      if (!catSelection || catSelection.selectedItems.length === 0) return false;
      
      // For protein categories, ensure all selected items have quantity > 0
      if (getCategoryBehavior(category).isProtein) {
        return catSelection.selectedItems.every(item => (item.quantity || 0) > 0);
      }
      
      return true;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate protein selection
    if (totalProteinQuantity === 0) {
      return; // Button should be disabled, but extra safety check
    }
    
    onAddToOrder(selections);
  };

  // If no combo categories exist
  if (!comboItem.comboCategories || comboItem.comboCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invalid Combo Item</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This combo item has no selection categories defined.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={onCancel}>Close</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto">
      <CardHeader className="space-y-2 p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl">
          Customize: {comboItem.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{comboItem.description}</p>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Validation Alert */}
          {!hasProteinSelection && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 flex items-center gap-2 font-medium">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                Please enter quantities for at least one protein option
              </p>
            </div>
          )}

          {comboItem.comboCategories.map((category) => {
            const catSelection = selections.selections.find(s => s.categoryId === category.id);
            const selectionCount = catSelection?.selectedItems.length || 0;
            const isComplete = selectionCount === category.maxSelections;
            const isSingleSelection = category.maxSelections === 1;
            
            return (
              <div key={category.id} className="border-2 rounded-xl p-4 sm:p-6 bg-card shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {isSingleSelection ? (
                        <p>Choose 1 option</p>
                      ) : (
                        <p>Choose up to {category.maxSelections} options</p>
                      )}
                      {getCategoryBehavior(category).isProtein && (
                        <p className="text-xs font-medium text-primary">Enter servings for each protein option below</p>
                      )}
                      {!getCategoryBehavior(category).isProtein && (
                        <p className="text-xs">Included for {Math.max(totalProteinQuantity, headcount ?? 1)} servings</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectionCount > 0 && (
                      <Badge variant="secondary" className="text-sm">
                        {selectionCount}/{category.maxSelections}
                      </Badge>
                    )}
                    {isComplete ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  {isSingleSelection ? (
                    // Radio buttons for single selection
                    <RadioGroup 
                      value={catSelection?.selectedItems[0]?.itemId || ""}
                      onValueChange={(value) => {
                        const item = category.items.find(i => i.id === value);
                        if (item) handleSingleSelection(category.id, item);
                      }}
                    >
                      {category.items.map((item) => {
                        const isSelected = catSelection?.selectedItems[0]?.itemId === item.id;
                        const isProt = getCategoryBehavior(category).isProtein;
                        const currentQty = getCurrentQuantity(category.id, item.id);
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`grid grid-cols-[auto,1fr,auto] items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl transition-all ${
                              isProt ? 'cursor-default' : 'cursor-pointer'
                            } ${
                              isSelected 
                                ? 'border-primary bg-primary/5 shadow-sm' 
                                : 'border-border hover:border-primary/50 hover:bg-accent/50'
                            }`}
                            onClick={() => {
                              if (!isProt) {
                                handleSingleSelection(category.id, item);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                              {!isProt && (
                                <RadioGroupItem value={item.id} id={item.id} className="flex-shrink-0" />
                              )}
                              {isProt && currentQty > 0 && (
                                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-primary flex items-center justify-center bg-primary">
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                              )}
                              {isProt && currentQty === 0 && (
                                <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-muted-foreground/30" />
                              )}
                              
                              {item.image && (
                                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                                  <ServiceImage 
                                    src={item.image} 
                                    alt={item.name} 
                                    aspectRatio="aspect-square"
                                    className="rounded-lg object-cover w-full h-full" 
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base mb-1">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</div>
                              )}
                              
                              {/* Dietary and allergen flags */}
                              {(item.dietaryFlags?.length || item.allergenFlags?.length) && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.dietaryFlags?.map(flag => (
                                    <Badge key={flag} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                      {flag.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                  {item.allergenFlags?.map(flag => (
                                    <Badge key={flag} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                      Contains: {flag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Price Display */}
                              <div className="flex items-center gap-2">
                                {isProt ? (
                                  item.additionalPrice ? (
                                    <span className="text-sm font-medium">+{formatPrice(item.additionalPrice)} per serving</span>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                      No Additional Charge
                                    </Badge>
                                  )
                                ) : (
                                  item.additionalPrice ? (
                                    <span className="text-sm font-medium">+{formatPrice(item.additionalPrice)} extra</span>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                      No Additional Charge
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            
                            {/* Quantity controls for proteins - always visible */}
                            {isProt && (
                              <div className="flex-shrink-0 justify-self-end">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-2 font-medium whitespace-nowrap">Servings</div>
                                  <CompactQuantityControls
                                    quantity={getCurrentQuantity(category.id, item.id)}
                                    onQuantityChange={(qty) => handleQuantityChange(category.id, item.id, qty)}
                                    minQuantity={0}
                                    size="md"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  ) : (
                    // Checkboxes for multiple selections
                    <div className="space-y-3 sm:space-y-4">
                      {category.items.map((item) => {
                        const isSelected = catSelection?.selectedItems.some(i => i.itemId === item.id) || false;
                        const isDisabled = !isSelected && selectionCount >= category.maxSelections;
                        const currentQty = getCurrentQuantity(category.id, item.id);
                        const isProt = getCategoryBehavior(category).isProtein;
                        
                        return (
                          <div 
                            key={item.id} 
                            className={`grid grid-cols-[auto,1fr,auto] items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 rounded-xl transition-all ${
                              isDisabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : isSelected
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                              {isProt ? (
                                <div className="w-5 h-5 flex-shrink-0 rounded border-2 border-primary flex items-center justify-center">
                                  {currentQty > 0 && (
                                    <div className="w-3 h-3 rounded-sm bg-primary" />
                                  )}
                                </div>
                              ) : (
                                <Checkbox 
                                  id={item.id} 
                                  checked={isSelected}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked) => {
                                    handleMultiSelection(category.id, item, checked === true);
                                  }}
                                  className="flex-shrink-0"
                                />
                              )}
                              
                              {item.image && (
                                <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                                  <ServiceImage 
                                    src={item.image} 
                                    alt={item.name} 
                                    aspectRatio="aspect-square"
                                    className="rounded-lg object-cover w-full h-full" 
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base mb-1">{item.name}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</div>
                              )}
                              
                                {!isProt && (totalProteinQuantity > 0 || (headcount ?? 0) > 0) && (
                                  <div className="text-xs text-muted-foreground mb-2">
                                  Included for {Math.max(totalProteinQuantity, headcount ?? 1)} servings
                                  </div>
                                )}
                              
                              {/* Dietary and allergen flags */}
                              {(item.dietaryFlags?.length || item.allergenFlags?.length) && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {item.dietaryFlags?.map(flag => (
                                    <Badge key={flag} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                      {flag.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                  {item.allergenFlags?.map(flag => (
                                    <Badge key={flag} variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                      Contains: {flag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Price Display */}
                              <div className="flex items-center gap-2">
                                {isProt ? (
                                  item.additionalPrice ? (
                                    <span className="text-sm font-medium">+{formatPrice(item.additionalPrice)} per serving</span>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                      No Additional Charge
                                    </Badge>
                                  )
                                ) : (
                                  item.additionalPrice ? (
                                    <span className="text-sm font-medium">+{formatPrice(item.additionalPrice)} extra</span>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                      No Additional Charge
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                            
                            {/* Quantity controls for proteins - always visible and prominent */}
                            {isProt && (
                              <div className="flex-shrink-0 justify-self-end">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground mb-2 font-medium whitespace-nowrap">Servings</div>
                                   <CompactQuantityControls
                                     quantity={currentQty}
                                     onQuantityChange={(qty) => {
                                       handleQuantityChange(category.id, item.id, qty);
                                     }}
                                     minQuantity={0}
                                     size="md"
                                     disabled={!isSelected && selectionCount >= category.maxSelections}
                                   />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
          
          <div className="border-t-2 pt-6 mt-8 space-y-6">
            {/* Detailed Selection Breakdown */}
            {calculationBreakdown && calculationBreakdown.breakdown.length > 0 && (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-blue-900">Your Selections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {calculationBreakdown.breakdown.map((category, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <p className="font-medium text-sm text-blue-800">{category.category}</p>
                      <div className="pl-3 space-y-1">
                        {category.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex justify-between items-center text-xs">
                            <span className="text-blue-700">
                              {item.name}
                              {item.quantity && item.quantity > 1 && ` ×${item.quantity}`}
                            </span>
                            <span className="font-medium text-blue-900">
                              {item.totalPrice > 0 ? `+${formatPrice(item.totalPrice)}` : 'Included'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="border-t-2 border-blue-300 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-blue-900">Total Price</span>
                    <span className="font-bold text-lg text-blue-900">{formatPrice(calculationBreakdown.totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Combo Order Summary */}
            {totalProteinQuantity > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-semibold text-blue-900 mb-4 text-lg">Order Summary</h4>
                <div className="text-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Total Combo Meals:</span>
                    <span className="font-bold text-blue-900 text-xl">{totalProteinQuantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800">Base Price per Combo:</span>
                    <span className="font-semibold text-blue-900 text-lg">{formatPrice(comboItem.price)}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-blue-300 text-xs text-blue-700 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>All sides/condiments included for {totalProteinQuantity} servings</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center p-5 bg-primary/5 rounded-xl border-2 border-primary/20">
              <div className="text-xl font-semibold">Total Price</div>
              <div className="text-2xl font-bold text-primary">{formatPrice(selections.totalPrice)}</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onCancel}
                size="lg"
                className="flex-1 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!hasProteinSelection}
                size="lg"
                className="flex-1 min-h-[44px] bg-[#F07712] hover:bg-[#F07712]/90"
              >
                Add to Order
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComboSelectionForm;
