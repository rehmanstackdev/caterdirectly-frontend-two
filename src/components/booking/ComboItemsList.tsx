import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, Users } from "lucide-react";

interface ComboItemsListProps {
  items: ComboPackage[];
  selectedItems: Record<string, number>;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
  onComboSelection?: (comboSelections: any) => void;
  serviceMinimumGuests?: number | string;
  serviceMaximumGuests?: number | string;
  guestBudget?: number;
  currentNonComboSubtotal?: number;
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
  dietaryFlags?: string[];
  allergenFlags?: string[];
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
  minimumGuests?: number | string;
  minGuests?: number | string;
  minGuestCount?: number | string;
  minimumGuest?: number | string;
  guestNumber?: number | string;
  guestCount?: number | string;
  maximumGuests?: number | string;
  maxGuests?: number | string;
  maxGuestCount?: number | string;
  maximumGuest?: number | string;
  serves?: number | string;
  servingSize?: number | string;
  servesCount?: number | string;
  peopleServed?: number | string;
}

const ComboItemsList = ({
  items,
  selectedItems,
  onItemQuantityChange,
  onComboSelection,
  serviceMinimumGuests,
  serviceMaximumGuests,
  guestBudget,
  currentNonComboSubtotal = 0,
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

  const getComboMinimumGuests = (combo: ComboPackage): number | null => {
    return (
      parseServesNumber(combo.minimumGuests) ||
      parseServesNumber(combo.minGuests) ||
      parseServesNumber(combo.minGuestCount) ||
      parseServesNumber(combo.minimumGuest) ||
      parseServesNumber(combo.guestNumber) ||
      parseServesNumber(combo.guestCount) ||
      null
    );
  };

  const getComboMaximumGuests = (combo: ComboPackage): number | null => {
    return (
      parseServesNumber(combo.maximumGuests) ||
      parseServesNumber(combo.maxGuests) ||
      parseServesNumber(combo.maxGuestCount) ||
      parseServesNumber(combo.maximumGuest) ||
      null
    );
  };

  const getEffectiveMinimumGuests = (combo: ComboPackage): number | null => {
    return (
      getComboMinimumGuests(combo) ||
      parseServesNumber(serviceMinimumGuests) ||
      null
    );
  };

  const getEffectiveMaximumGuests = (combo: ComboPackage): number | null => {
    return (
      getComboMaximumGuests(combo) ||
      parseServesNumber(serviceMaximumGuests) ||
      null
    );
  };

  const clampGuestCount = (
    value: number,
    minGuests: number | null,
    maxGuests: number | null,
  ): number => {
    let result = Math.max(1, Math.round(value));
    if (minGuests && result < minGuests) result = minGuests;
    if (maxGuests && result > maxGuests) result = maxGuests;
    return result;
  };

  const getDefaultPeople = (combo: ComboPackage): number => {
    const minimumGuests = getEffectiveMinimumGuests(combo);
    const maximumGuests = getEffectiveMaximumGuests(combo);
    const serves = getComboServes(combo);
    const preferredValue = minimumGuests || serves || 1;
    return clampGuestCount(preferredValue, minimumGuests, maximumGuests);
  };

  const getPeopleOptionsForCombo = (combo: ComboPackage): number[] => {
    const minimumGuests = getEffectiveMinimumGuests(combo) || 1;
    const maximumGuests = getEffectiveMaximumGuests(combo);

    if (!maximumGuests || maximumGuests < minimumGuests) {
      return [minimumGuests];
    }

    return Array.from(
      { length: maximumGuests - minimumGuests + 1 },
      (_, index) => minimumGuests + index,
    );
  };

  const getPeopleForCombo = (combo: ComboPackage): number => {
    const minimumGuests = getEffectiveMinimumGuests(combo);
    const maximumGuests = getEffectiveMaximumGuests(combo);
    const persistedHeadcount = selectedItems[`meta_${combo.id}_headcount`];
    const selectedPeople =
      peopleByCombo[combo.id] ||
      (typeof persistedHeadcount === "number" && persistedHeadcount > 0
        ? persistedHeadcount
        : getDefaultPeople(combo));
    return clampGuestCount(selectedPeople, minimumGuests, maximumGuests);
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

  const getSelectedItemAmount = (item: ComboCategoryItem): number => {
    const premiumCharge =
      parseMoney(item.additionalCharge) || parseMoney(item.additionalPrice);

    // Premium items contribute only their extra charge.
    if (premiumCharge > 0) {
      return premiumCharge;
    }

    return 0;
  };

  const dietaryBadgeMap: Record<
    string,
    { short: string; label: string; className: string }
  > = {
    gluten_free: {
      short: "GF",
      label: "Gluten Free",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white  ",
    },
    dairy_free: {
      short: "DF",
      label: "Dairy Free",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    nut_free: {
      short: "NF",
      label: "Nut Free",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    vegetarian: {
      short: "V",
      label: "Vegetarian",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    vegan: {
      short: "VG",
      label: "Vegan",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    halal: {
      short: "H",
      label: "Halal",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    kosher: {
      short: "K",
      label: "Kosher",
      className:
        "bg-transparent  h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
  };

  const allergenBadgeMap: Record<
    string,
    { short: string; label: string; className: string }
  > = {
    nuts: {
      short: "N",
      label: "Contains Nuts",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    dairy: {
      short: "D",
      label: "Contains Dairy",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    eggs: {
      short: "E",
      label: "Contains Eggs",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    shellfish: {
      short: "SF",
      label: "Contains Shellfish",
      className:
        "bg-transparent  h-3 w-3 text-emerald-700 border-gray hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    wheat: {
      short: "W",
      label: "Contains Wheat",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    soy: {
      short: "S",
      label: "Contains Soy",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
    fish: {
      short: "F",
      label: "Contains Fish",
      className:
        "bg-transparent h-3 w-3 text-emerald-700 border-black hover:bg-orange-400 hover:border-0 hover:text-white",
    },
  };

  const normalizeFlag = (flag: string) =>
    flag
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");

  const getItemFlagBadges = (item: ComboCategoryItem) => {
    const badges: Array<{
      key: string;
      short: string;
      label: string;
      className: string;
    }> = [];

    (item.dietaryFlags || []).forEach((flag) => {
      const key = normalizeFlag(flag);
      const mapped = dietaryBadgeMap[key];
      if (mapped) {
        badges.push({
          key: `dietary_${key}`,
          short: mapped.short,
          label: mapped.label,
          className: mapped.className,
        });
      }
    });

    (item.allergenFlags || []).forEach((flag) => {
      const key = normalizeFlag(flag);
      const mapped = allergenBadgeMap[key];
      if (mapped) {
        badges.push({
          key: `allergen_${key}`,
          short: mapped.short,
          label: mapped.label,
          className: mapped.className,
        });
      }
    });

    return badges;
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
          return subTotal + getSelectedItemAmount(item);
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
  const activeComboPeopleOptions = activeCombo
    ? getPeopleOptionsForCombo(activeCombo)
    : [1];
  const activeComboPeople = activeCombo
    ? (() => {
        const selectedPeople = getPeopleForCombo(activeCombo);
        return activeComboPeopleOptions.includes(selectedPeople)
          ? selectedPeople
          : activeComboPeopleOptions[0] || selectedPeople;
      })()
    : 5;
  const activeComboGrandTotal = activeComboPerPersonTotal * activeComboPeople;

  const commitDraftSelections = () => {
    if (!activeCombo) return;

    // Budget check: combo total + existing non-combo items must not exceed budget
    if (guestBudget && guestBudget > 0) {
      const comboGrandTotal = activeComboGrandTotal;
      if (currentNonComboSubtotal + comboGrandTotal > guestBudget) {
        toast.error(
          `This combo package (${formatCurrency(comboGrandTotal)}) exceeds your remaining budget of ${formatCurrency(guestBudget - currentNonComboSubtotal)}.`,
        );
        return;
      }
    }

    // Update individual item keys in selectedItems
    getComboItemKeys(activeCombo).forEach((key) => {
      const currentQty = selectedItems[key] || 0;
      const draftQty = draftSelections[key] || 0;
      if (currentQty !== draftQty) {
        onItemQuantityChange(key, draftQty);
      }
    });

    // Persist combo metadata (headcount, basePrice) in selectedItems for durability
    // These survive navigation/state transitions even if comboSelectionsList is lost
    const comboBasePrice = getComboBasePrice(activeCombo);
    onItemQuantityChange(`meta_${activeCombo.id}_headcount`, activeComboPeople);
    onItemQuantityChange(
      `meta_${activeCombo.id}_basePrice`,
      Math.round(comboBasePrice * 100),
    );

    // Send full combo selection with headcount via onComboSelection
    if (onComboSelection) {
      const selections = (activeCombo.comboCategories || [])
        .map((category) => {
          const categoryItems = category.items || [];
          const selectedCategoryItems = categoryItems
            .filter((item) => {
              const key = getItemSelectionKey(
                activeCombo.id,
                category.id,
                item,
              );
              return (draftSelections[key] || 0) > 0;
            })
            .map((item) => ({
              itemId: item.id,
              itemName: item.name,
              image: item.image || item.imageUrl || "",
              additionalPrice: getSelectedItemAmount(item),
              quantity: 1,
              price: parseMoney(item.price),
            }));
          return {
            categoryId: category.id,
            categoryName: category.name,
            selectedItems: selectedCategoryItems,
          };
        })
        .filter((cat) => cat.selectedItems.length > 0);

      const comboSelection = {
        comboItemId: activeCombo.id,
        comboName: activeCombo.name,
        basePrice: getComboBasePrice(activeCombo),
        selections,
        totalPrice: activeComboGrandTotal,
        headcount: activeComboPeople,
      };
      onComboSelection(comboSelection);
    }

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

            const rawMax = Number(category.maxSelections);
            const maxSelections =
              Number.isFinite(rawMax) && rawMax > 0
                ? rawMax
                : Math.max(1, categoryItems.length);
            const isSingleSelectCategory = maxSelections === 1;

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
                    const totalPrice = getSelectedItemAmount(item);
                    const itemBasePrice = parseMoney(item.price);
                    const premiumCharge =
                      parseMoney(item.additionalCharge) ||
                      parseMoney(item.additionalPrice);
                    const itemBadges = getItemFlagBadges(item);

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-row-reverse items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors ${checked ? "border-orange-300 bg-orange-50 " : "border-gray-200 bg-gray-50"}`}
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
                            {item.isPremium &&
                            itemBasePrice > 0 &&
                            premiumCharge > 0 ? (
                              <div className="text-sm font-semibold">
                                <span className="text-green-700">
                                  {formatCurrency(itemBasePrice)}
                                </span>
                                <span className="text-gray-500"> + </span>
                                <span className="text-purple-600">
                                  ({formatCurrency(premiumCharge)})
                                </span>
                              </div>
                            ) : item.isPremium && premiumCharge > 0 ? (
                              <div className="text-sm font-semibold text-purple-600">
                                ({formatCurrency(premiumCharge)})
                              </div>
                            ) : totalPrice > 0 ? (
                              <div className="text-sm text-green-700 font-semibold">
                                {formatCurrency(totalPrice)}
                              </div>
                            ) : (
                              <div className="text-sm text-green-700 font-medium">
                                {itemBasePrice > 0
                                  ? `${formatCurrency(itemBasePrice)} `
                                  : " "}
                              </div>
                            )}
                          </div>

                          {itemBadges.length > 0 && (
                            <TooltipProvider delayDuration={120}>
                              <div className="mt-1 flex items-center gap-1 flex-wrap">
                                {itemBadges.map((badge) => (
                                  <Tooltip key={badge.key}>
                                    <TooltipTrigger asChild>
                                      <span
                                        className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-[10px] font-bold ${badge.className}`}
                                      >
                                        {badge.short}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="text-xs"
                                    >
                                      {badge.label}
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </TooltipProvider>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isSingleSelectCategory ? (
                            <input
                              type="radio"
                              name={`combo-${combo.id}-${category.id}`}
                              checked={checked}
                              onChange={(e) =>
                                setDraftSelections((prev) => {
                                  const next = { ...prev };
                                  categoryItems.forEach((catItem) => {
                                    const catKey = getItemSelectionKey(
                                      combo.id,
                                      category.id,
                                      catItem,
                                    );
                                    next[catKey] = 0;
                                  });
                                  next[itemId] = e.target.checked ? 1 : 0;
                                  return next;
                                })
                              }
                              className="h-4 w-4 cursor-pointer appearance-none rounded-full border transition-colors"
                              style={
                                checked
                                  ? {
                                      backgroundColor: "#f97316",
                                      borderColor: "#f97316",
                                      boxShadow: "inset 0 0 0 3px #fff",
                                    }
                                  : {
                                      backgroundColor: "#fff",
                                      borderColor: "#fdba74",
                                    }
                              }
                            />
                          ) : (
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
                          )}
                        </div>
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
                  {serviceMinimumGuests && (
                    <span className="text-gray-700">
                      Minimum
                      <span className="text-green-500 font-bold mx-1">
                        {serviceMinimumGuests}
                      </span>
                      peoples serves
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="px-5 pt-3 pb-2">
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Select quantity:
                </label>
                <Select
                  value={String(activeComboPeople)}
                  onValueChange={(value) => {
                    handlePeopleChange(activeCombo.id, Number(value));
                  }}
                >
                  <SelectTrigger className="h-12 w-full border-orange-200 bg-white text-sm text-gray-800 focus:ring-orange-400 focus:ring-offset-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      <SelectValue>
                        {activeComboPeople}{" "}
                        {activeComboPeople === 1 ? "person" : "people"}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 mt-1">
                    {activeComboPeopleOptions.map((count) => (
                      <SelectItem
                        key={count}
                        value={String(count)}
                        className="focus:bg-orange-50 focus:text-orange-700"
                      >
                        {count} {count === 1 ? "person" : "people"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
