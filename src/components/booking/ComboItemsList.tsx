import React, { useMemo, useState } from "react";
import ServiceImage from "@/components/shared/ServiceImage";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye } from "lucide-react";

interface ComboItemsListProps {
  items: ComboPackage[];
  selectedItems: Record<string, number>;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
}

interface ComboCategoryItem {
  id: string;
  name: string;
  price?: number;
  isPremium?: boolean;
  additionalCharge?: number;
  image?: string;
  imageUrl?: string;
  selectionKey?: string;
}

interface ComboCategory {
  id: string;
  name: string;
  maxSelections?: number;
  items?: ComboCategoryItem[];
}

interface ComboPackage {
  id: string;
  name: string;
  description?: string;
  category?: string;
  pricePerPerson?: number;
  price?: number;
  imageUrl?: string;
  comboCategories?: ComboCategory[];
}

const ComboItemsList = ({
  items,
  selectedItems,
  onItemQuantityChange,
}: ComboItemsListProps) => {
  const [activeComboId, setActiveComboId] = useState<string | null>(null);

  const activeCombo = useMemo(
    () => items.find((combo) => combo.id === activeComboId) || null,
    [items, activeComboId],
  );

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No combo packages available
      </div>
    );
  }

  const getComboBasePrice = (combo: ComboPackage) => {
    return combo.pricePerPerson || combo.price || 0;
  };

  const getItemSelectionKey = (
    comboId: string,
    categoryId: string,
    item: ComboCategoryItem,
  ) => item.selectionKey || `${comboId}_${categoryId}_${item.id}`;

  const renderComboCategories = (combo: ComboPackage) => {
    if (!combo.comboCategories || combo.comboCategories.length === 0) {
      return null;
    }

    return (
      <div className="border-t border-orange-200 pt-3">
        <h6 className="text-xs font-medium text-gray-700 mb-2">
          Package Includes:
        </h6>
        <div className="space-y-2">
          {combo.comboCategories.map((category) => {
            const categoryItems = category.items || [];
            const maxSelections =
              typeof category.maxSelections === "number" &&
              category.maxSelections > 0
                ? category.maxSelections
                : Math.max(1, categoryItems.length);

            const selectedCount = categoryItems.reduce((count, item) => {
              const key = getItemSelectionKey(combo.id, category.id, item);
              return count + ((selectedItems[key] || 0) > 0 ? 1 : 0);
            }, 0);

            return (
              <div
                key={category.id}
                className="bg-white rounded-md p-2 border border-orange-100"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-xs font-medium text-gray-800">
                    {category.name}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Select up to {maxSelections}
                  </div>
                </div>

                <div className="space-y-2">
                  {categoryItems.map((item) => {
                    const itemId = getItemSelectionKey(
                      combo.id,
                      category.id,
                      item,
                    );
                    const checked = (selectedItems[itemId] || 0) > 0;
                    const disableUnchecked =
                      !checked && selectedCount >= maxSelections;
                    const itemPrice = Number(item.price || 0);
                    const additionalCharge = Number(item.additionalCharge || 0);
                    const totalPrice = itemPrice || 0;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 rounded px-2 py-2 border transition-colors ${checked ? "border-orange-300 bg-orange-50 " : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
                          {(item.image || item.imageUrl) && (
                            <div className="w-7 h-7 sm:w-6 sm:h-6 rounded overflow-hidden flex-shrink-0">
                              <ServiceImage
                                src={item.image || item.imageUrl || ""}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                showLoadingPlaceholder={false}
                              />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-700 font-medium leading-tight break-words">
                                {item.name}
                              </span>
                              {item.isPremium && (
                                <Badge
                                  variant="default"
                                  className="bg-purple-600 text-white text-[10px] py-0 px-1.5 h-4"
                                >
                                  Premium
                                </Badge>
                              )}
                            </div>

                            {totalPrice > 0 && (
                              <div className="text-xs text-green-600 font-semibold">
                                {formatCurrency(totalPrice)}
                                {item.isPremium && additionalCharge > 0 && (
                                  <span className="text-gray-500 ml-1">
                                    (+{formatCurrency(additionalCharge)})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Checkbox
                          className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white"
                          checked={checked}
                          disabled={disableUnchecked}
                          onCheckedChange={(nextChecked) =>
                            onItemQuantityChange(
                              itemId,
                              nextChecked === true ? 1 : 0,
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
        {items.map((combo) => {
          const basePrice = getComboBasePrice(combo);
          const hasComboDetails = Boolean(
            combo.comboCategories && combo.comboCategories.length > 0,
          );

          return (
            <div
              key={combo.id}
              className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                <div className="w-16 h-16 sm:w-16 sm:h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                  {combo.imageUrl ? (
                    <ServiceImage
                      src={combo.imageUrl}
                      alt={combo.name}
                      className="w-full h-full object-cover"
                      showLoadingPlaceholder={false}
                      aspectRatio="aspect-square"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-bold">
                        {combo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                    <h5 className="font-semibold text-base text-gray-900 break-words">
                      {combo.name}
                    </h5>
                    <div className="text-left sm:text-right flex-shrink-0 sm:ml-2">
                      <div className="font-bold text-lg text-orange-600">
                        {formatCurrency(basePrice)}
                      </div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                  </div>

                  {combo.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {combo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-700 border-orange-200"
                    >
                      {combo.category}
                    </Badge>
                    {hasComboDetails && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveComboId(combo.id)}
                        className="h-7 w-full sm:w-auto px-3 text-xs font-semibold rounded-full border border-orange-300 bg-orange-100 text-orange-700 hover:bg-white hover:text-orange-800 shadow-sm justify-center"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        View Combo Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={Boolean(activeCombo)}
        onOpenChange={(open) => !open && setActiveComboId(null)}
      >
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          {activeCombo && (
            <>
              <DialogHeader>
                <DialogTitle>{activeCombo.name} Details</DialogTitle>
              </DialogHeader>
              {renderComboCategories(activeCombo)}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComboItemsList;
