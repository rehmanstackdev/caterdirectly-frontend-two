import React, { useEffect, useMemo, useState } from "react";
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
import { ChevronDown, Eye, Users } from "lucide-react";

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
  additionalPrice?: number;
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
  serves?: number | string;
  servingSize?: number | string;
  servesCount?: number | string;
  peopleServed?: number | string;
}

const PEOPLE_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

const ComboItemsList = ({
  items,
  selectedItems,
  onItemQuantityChange,
}: ComboItemsListProps) => {
  const [activeComboId, setActiveComboId] = useState<string | null>(null);
  const [peopleByCombo, setPeopleByCombo] = useState<Record<string, number>>(
    {},
  );
  const [isDialogScrolled, setIsDialogScrolled] = useState(false);
  const [isDialogAtBottom, setIsDialogAtBottom] = useState(false);
  const [draftSelections, setDraftSelections] = useState<
    Record<string, number>
  >({});

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

  const parseMoney = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const getComboBasePrice = (combo: ComboPackage) => {
    return parseMoney(combo.pricePerPerson) || parseMoney(combo.price);
  };

  const parseServesNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    return null;
  };

  const getComboServes = (combo: ComboPackage): number | null => {
    return (
      parseServesNumber(combo.serves) ||
      parseServesNumber(combo.servingSize) ||
      parseServesNumber(combo.servesCount) ||
      parseServesNumber(combo.peopleServed) ||
      null
    );
  };

  const getDefaultPeople = (combo: ComboPackage): number => {
    const serves = getComboServes(combo);
    if (serves && serves > 0) {
      const rounded = Math.ceil(serves / 5) * 5;
      return Math.max(5, Math.min(100, rounded));
    }
    return 5;
  };

  const getPeopleForCombo = (combo: ComboPackage): number => {
    return peopleByCombo[combo.id] || getDefaultPeople(combo);
  };

  const handlePeopleChange = (comboId: string, people: number) => {
    setPeopleByCombo((prev) => ({
      ...prev,
      [comboId]: people,
    }));
  };

  const getItemSelectionKey = (
    comboId: string,
    categoryId: string,
    item: ComboCategoryItem,
  ) => item.selectionKey || `${comboId}_${categoryId}_${item.id}`;

  const getComboItemKeys = (combo: ComboPackage): string[] => {
    if (!combo.comboCategories || combo.comboCategories.length === 0) return [];

    const keys: string[] = [];
    combo.comboCategories.forEach((category) => {
      (category.items || []).forEach((item) => {
        keys.push(getItemSelectionKey(combo.id, category.id, item));
      });
    });

    return keys;
  };

  useEffect(() => {
    if (!activeCombo) return;

    const nextDraft: Record<string, number> = {};
    getComboItemKeys(activeCombo).forEach((key) => {
      nextDraft[key] = selectedItems[key] || 0;
    });
    setDraftSelections(nextDraft);
  }, [activeCombo, selectedItems]);

  const getSelectedItemUpcharge = (item: ComboCategoryItem): number => {
    return (
      parseMoney(item.additionalCharge) ||
      parseMoney(item.additionalPrice) ||
      parseMoney(item.price)
    );
  };

  const getSelectedExtraPerPerson = (
    combo: ComboPackage,
    sourceSelections: Record<string, number>,
  ) => {
    if (!combo.comboCategories || combo.comboCategories.length === 0) return 0;

    return combo.comboCategories.reduce((total, category) => {
      const categoryItems = category.items || [];
      return (
        total +
        categoryItems.reduce((subTotal, item) => {
          const key = getItemSelectionKey(combo.id, category.id, item);
          const isSelected = (sourceSelections[key] || 0) > 0;
          if (!isSelected) return subTotal;
          return subTotal + getSelectedItemUpcharge(item);
        }, 0)
      );
    }, 0);
  };

  const activeComboBasePrice = activeCombo ? getComboBasePrice(activeCombo) : 0;
  const activeComboExtraPrice = activeCombo
    ? getSelectedExtraPerPerson(activeCombo, draftSelections)
    : 0;
  const activeComboPerPersonTotal =
    activeComboBasePrice + activeComboExtraPrice;

  const activeComboServes = activeCombo ? getComboServes(activeCombo) : null;
  const activeComboPeople = activeCombo ? getPeopleForCombo(activeCombo) : 5;
  const activeComboGrandTotal = activeComboPerPersonTotal * activeComboPeople;

  const commitDraftSelections = () => {
    if (!activeCombo) return;

    getComboItemKeys(activeCombo).forEach((key) => {
      const currentQty = selectedItems[key] || 0;
      const draftQty = draftSelections[key] || 0;
      if (currentQty !== draftQty) {
        onItemQuantityChange(key, draftQty);
      }
    });

    setActiveComboId(null);
    setIsDialogScrolled(false);
    setIsDialogAtBottom(false);
    setDraftSelections({});
  };

  const renderComboCategories = (combo: ComboPackage) => {
    if (!combo.comboCategories || combo.comboCategories.length === 0) {
      return null;
    }

    return (
      <div className="pt-3">
        <h6 className="text-xs font-medium text-gray-700 mb-2 uppercase leading-relaxed">
          PACKAGE INCLUDES
        </h6>
        <div className="space-y-2.5">
          {combo.comboCategories.map((category) => {
            const categoryItems = category.items || [];
            const maxSelections =
              typeof category.maxSelections === "number" &&
              category.maxSelections > 0
                ? category.maxSelections
                : Math.max(1, categoryItems.length);

            const selectedCount = categoryItems.reduce((count, item) => {
              const key = getItemSelectionKey(combo.id, category.id, item);
              return count + ((draftSelections[key] || 0) > 0 ? 1 : 0);
            }, 0);

            return (
              <div
                key={category.id}
                className="bg-white rounded-lg p-3 border border-orange-100"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                      Select up to {maxSelections}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {categoryItems.map((item) => {
                    const itemId = getItemSelectionKey(
                      combo.id,
                      category.id,
                      item,
                    );
                    const checked = (draftSelections[itemId] || 0) > 0;
                    const disableUnchecked =
                      !checked && selectedCount >= maxSelections;
                    const totalPrice = getSelectedItemUpcharge(item);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors ${checked ? "border-orange-300 bg-orange-50 " : "border-gray-200 bg-gray-50"}`}
                      >
                        <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
                          {(item.image || item.imageUrl) && (
                            <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0">
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
                              <span className="text-sm text-gray-800 font-semibold leading-tight break-words">
                                {item.name}
                              </span>
                              {item.isPremium && (
                                <Badge
                                  variant="default"
                                  className="bg-purple-600 text-white text-[11px] py-0.5 px-2 h-5"
                                >
                                  Premium
                                </Badge>
                              )}
                            </div>

                            {totalPrice > 0 ? (
                              <div className="text-sm text-green-700 font-semibold">
                                +{formatCurrency(totalPrice)} / person
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 font-medium">
                                Included
                              </div>
                            )}
                          </div>
                        </div>
                        <Checkbox
                          className="border-orange-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white"
                          checked={checked}
                          disabled={disableUnchecked}
                          onCheckedChange={(nextChecked) =>
                            setDraftSelections((prev) => ({
                              ...prev,
                              [itemId]: nextChecked === true ? 1 : 0,
                            }))
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
          const comboServes = getComboServes(combo);

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
                      {comboServes && (
                        <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                          Serves {comboServes}
                        </div>
                      )}
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
        onOpenChange={(open) => {
          if (!open) {
            setActiveComboId(null);
            setIsDialogScrolled(false);
            setIsDialogAtBottom(false);
            setDraftSelections({});
          }
        }}
      >
        <DialogContent className="w-[95vw] !max-w-[750px] max-h-[100vh] !rounded-3xl p-0 overflow-hidden ">
          {activeCombo && (
            <div className="flex max-h-[88vh]   flex-col bg-white">
              <DialogHeader
                className={`px-5 pt-4 pb-3 border-b border-gray-200 bg-white rounded-lg transition-shadow ${
                  isDialogScrolled ? "shadow-[0_4px_12px_rgba(0,0,0,0.08)]" : ""
                }`}
              >
                <DialogTitle className="text-[34px] leading-tight font-semibold text-gray-900">
                  {activeCombo.name}
                </DialogTitle>

                <div className="text-sm text-gray-800 leading-tight">
                  <span className="font-semibold">
                    {formatCurrency(activeComboGrandTotal)}
                  </span>{" "}
                  <span className="text-gray-700">
                    ({formatCurrency(activeComboPerPersonTotal)} / person)
                  </span>{" "}
                  {activeComboServes && (
                    <span className="text-gray-700">
                      Serves {activeComboServes}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="px-5 pt-3">
                <label className="mb-1 block text-xs font-bold text-[14px] text-gray-700">
                  Select quantity:
                </label>
                <div className="relative">
                  <select
                    value={activeComboPeople}
                    onChange={(e) =>
                      handlePeopleChange(activeCombo.id, Number(e.target.value))
                    }
                    className="h-12 w-full appearance-none rounded-md border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-800 outline-none focus:border-orange-400"
                  >
                    {PEOPLE_OPTIONS.map((count) => (
                      <option key={count} value={count}>
                        {count} people
                      </option>
                    ))}
                  </select>
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div
                className="flex-1 overflow-y-auto  px-5 py-3 pb-15"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const scrolled = el.scrollTop > 4;
                  const atBottom =
                    el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
                  setIsDialogScrolled(scrolled);
                  setIsDialogAtBottom(atBottom);
                }}
              >
                {renderComboCategories(activeCombo)}
              </div>

              <div
                className={`sticky bottom-0 border-t border-gray-200 bg-orange-500 rounded-lg px-4 py-3 transition-shadow ${
                  isDialogScrolled && !isDialogAtBottom
                    ? "shadow-[0_-6px_14px_rgba(0,0,0,0.18)]"
                    : ""
                }`}
              >
                <Button
                  type="button"
                  onClick={commitDraftSelections}
                  className="h-12 w-full bg-transparent hover:bg-transparent text-white font-semibold p-0"
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-lg">Add to Cart</span>
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-lg font-bold">
                        {formatCurrency(activeComboGrandTotal)}
                      </span>
                      <span className="text-xs font-medium opacity-95">
                        {formatCurrency(activeComboPerPersonTotal)} / person
                      </span>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComboItemsList;
