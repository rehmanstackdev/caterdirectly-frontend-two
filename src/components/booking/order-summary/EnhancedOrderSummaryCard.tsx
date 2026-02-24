import React, { useMemo } from "react";
import { ServiceSelection } from "@/types/order";
import { calculateUnifiedOrderTotals } from "@/utils/unified-calculations";
import { getSelectedItemsCountForService } from "@/utils/order-summary-utils";
import {
  calculateCateringPrice,
  extractCateringItems,
} from "@/utils/catering-price-calculation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ServiceSummaryItem from "./ServiceSummaryItem";
import { CustomAdjustment } from "@/types/adjustments";
import { ShoppingBag, ShoppingBasket } from "lucide-react";

interface EnhancedOrderSummaryCardProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  showDetailedBreakdown?: boolean;
  showCheckoutTaxNote?: boolean;
  showItemCountFooter?: boolean;
  className?: string;
  customAdjustments?: CustomAdjustment[];
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  serviceDeliveryFees?: Record<string, { range: string; fee: number }>;
  serviceDistances?: Record<string, number>;
  guestCount?: number;
}

const EnhancedOrderSummaryCard = React.memo(
  ({
    selectedServices,
    selectedItems,
    showDetailedBreakdown = false,
    showCheckoutTaxNote = true,
    showItemCountFooter = true,
    className = "",
    customAdjustments = [],
    isTaxExempt = false,
    isServiceFeeWaived = false,
    serviceDeliveryFees = {},
    serviceDistances = {},
    guestCount = 1,
  }: EnhancedOrderSummaryCardProps) => {
    const calculations = useMemo(() => {
      return calculateUnifiedOrderTotals(
        selectedServices,
        selectedItems,
        undefined,
        undefined,
        undefined,
        customAdjustments,
        undefined,
        isTaxExempt,
        isServiceFeeWaived,
        guestCount,
      );
    }, [
      selectedServices,
      selectedItems,
      customAdjustments,
      isTaxExempt,
      isServiceFeeWaived,
      guestCount,
    ]);

    const totalDeliveryFees = useMemo(() => {
      return Object.entries(serviceDeliveryFees).reduce(
        (sum, [serviceId, feeInfo]) => {
          let distance = serviceDistances[serviceId];

          if (!distance) {
            const service = selectedServices.find(
              (s) => (s.id || s.serviceId) === serviceId,
            );
            if (service) {
              distance =
                serviceDistances[service.id] ||
                serviceDistances[service.serviceId];
            }
          }

          if (feeInfo.fee && ((distance && distance > 0) || !distance)) {
            return sum + (feeInfo.fee || 0);
          }
          return sum;
        },
        0,
      );
    }, [serviceDeliveryFees, serviceDistances, selectedServices]);

    const cateringCalculations = useMemo(() => {
      const calculations: Record<
        string,
        ReturnType<typeof calculateCateringPrice> & {
          menuItems: Array<{
            name: string;
            quantity: number;
            price: number;
            additionalCharge: number;
          }>;
          simpleItems: Array<{ name: string; quantity: number; price: number }>;
          premiumItems: Array<{
            name: string;
            quantity: number;
            price: number;
            additionalCharge: number;
          }>;
          comboCards: Array<{
            comboId: string;
            comboName: string;
            quantity: number;
            simpleItems: Array<{
              name: string;
              quantity: number;
              price: number;
            }>;
            premiumItems: Array<{
              name: string;
              quantity: number;
              price: number;
              additionalCharge: number;
            }>;
          }>;
        }
      > = {};

      selectedServices.forEach((service) => {
        const serviceType = service.serviceType || service.type || "";
        if (serviceType === "catering" && service.service_details) {
          const serviceId = service.id || service.serviceId;
          const { baseItems, additionalChargeItems, comboCategoryItems } =
            extractCateringItems(selectedItems, service.service_details);

          const basePricePerPerson = baseItems.reduce((sum, item) => {
            return sum + item.price * item.quantity;
          }, 0);

          const additionalCharges = additionalChargeItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            additionalCharge: item.additionalCharge,
            isMenuItem: item.isMenuItem,
          }));

          const calcResult = calculateCateringPrice(
            basePricePerPerson,
            additionalCharges,
            guestCount,
            comboCategoryItems,
          );

          const menuItems = additionalChargeItems
            .filter((item) => item.isMenuItem)
            .map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              additionalCharge: item.additionalCharge,
            }));

          const simpleItems = comboCategoryItems.filter(
            (item) => !item.additionalCharge || item.additionalCharge === 0,
          );
          const premiumItems = comboCategoryItems
            .filter(
              (item) => item.additionalCharge && item.additionalCharge > 0,
            )
            .map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              additionalCharge: item.additionalCharge!,
            }));

          const comboCards = (() => {
            const combos = service.service_details?.catering?.combos || [];
            const comboById = new Map<string, any>();
            combos.forEach((combo: any) => {
              if (combo?.id) comboById.set(String(combo.id), combo);
              if (combo?.itemId) comboById.set(String(combo.itemId), combo);
            });

            const itemsByComboId: Record<
              string,
              Array<{
                name: string;
                quantity: number;
                price: number;
                additionalCharge?: number;
              }>
            > = {};

            Object.entries(selectedItems).forEach(
              ([selectedId, selectedQty]) => {
                if (!selectedQty || selectedQty <= 0) return;

                if (
                  !(
                    selectedId.includes("_") &&
                    selectedId.split("_").length >= 3
                  )
                )
                  return;

                const [comboId, categoryId, actualItemId] =
                  selectedId.split("_");
                const combo = comboById.get(comboId);
                if (!combo?.comboCategories) return;

                const category = combo.comboCategories.find(
                  (cat: any) =>
                    cat.id === categoryId || cat.categoryId === categoryId,
                );
                const categoryItem = category?.items?.find(
                  (item: any) =>
                    item.id === actualItemId || item.itemId === actualItemId,
                );
                if (!categoryItem) return;

                const price = parseFloat(String(categoryItem.price || 0)) || 0;
                const additionalCharge =
                  parseFloat(String(categoryItem.additionalCharge || 0)) || 0;

                (itemsByComboId[comboId] ||= []).push({
                  name:
                    categoryItem.name || categoryItem.itemName || actualItemId,
                  quantity: selectedQty as number,
                  price,
                  additionalCharge:
                    additionalCharge > 0 ? additionalCharge : undefined,
                });
              },
            );

            const cards: Array<{
              comboId: string;
              comboName: string;
              quantity: number;
              simpleItems: Array<{
                name: string;
                quantity: number;
                price: number;
              }>;
              premiumItems: Array<{
                name: string;
                quantity: number;
                price: number;
                additionalCharge: number;
              }>;
            }> = [];

            const baseCombos = baseItems.filter((b) => b.isCombo);
            const seen = new Set<string>();

            baseCombos.forEach((combo) => {
              const comboId = String(combo.id);
              seen.add(comboId);
              const items = itemsByComboId[comboId] || [];

              cards.push({
                comboId,
                comboName: combo.name,
                quantity: combo.quantity,
                simpleItems: items
                  .filter(
                    (i) => !i.additionalCharge || i.additionalCharge === 0,
                  )
                  .map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                premiumItems: items
                  .filter((i) => i.additionalCharge && i.additionalCharge > 0)
                  .map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                    additionalCharge: i.additionalCharge!,
                  })),
              });
            });

            Object.keys(itemsByComboId).forEach((comboId) => {
              if (seen.has(comboId)) return;
              const combo = comboById.get(comboId);
              const items = itemsByComboId[comboId] || [];

              cards.push({
                comboId,
                comboName: combo?.name || combo?.itemName || combo,
                quantity: 1,
                simpleItems: items
                  .filter(
                    (i) => !i.additionalCharge || i.additionalCharge === 0,
                  )
                  .map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                premiumItems: items
                  .filter((i) => i.additionalCharge && i.additionalCharge > 0)
                  .map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                    additionalCharge: i.additionalCharge!,
                  })),
              });
            });

            return cards;
          })();
          calculations[serviceId] = {
            ...calcResult,
            menuItems,
            simpleItems,
            premiumItems,
            comboCards,
          };
        }
      });

      return calculations;
    }, [selectedServices, selectedItems, guestCount]);

    const hasItems =
      selectedServices.length > 0 ||
      Object.keys(selectedItems).length > 0 ||
      (customAdjustments?.length || 0) > 0;
    const totalItemsSelected = useMemo(
      () =>
        selectedServices.reduce(
          (sum, s) => sum + getSelectedItemsCountForService(s, selectedItems),
          0,
        ),
      [selectedServices, selectedItems],
    );
    if (!hasItems) {
      return (
        <Card className={`bg-muted/5 border-dashed ${className}`}>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No services selected yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add services to see your order summary
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        className={`bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 shadow-lg ${className}`}
      >
        <CardHeader className="pb-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <span className="font-bold">Order Summary</span>
            {selectedServices.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs ml-auto bg-orange-500 text-white hover:bg-orange-600"
              >
                {selectedServices.length} service
                {selectedServices.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          {selectedServices.length > 0 && (
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-orange-100">
                {selectedServices.map((service, index) => {
                  const serviceId =
                    service?.id || service?.serviceId || `service-${index}`;
                  const serviceType = service.serviceType || service.type || "";
                  const isCatering = serviceType === "catering";
                  const cateringCalc = isCatering
                    ? cateringCalculations[serviceId]
                    : null;

                  let deliveryFee = serviceDeliveryFees[serviceId];
                  if (!deliveryFee && service?.id) {
                    deliveryFee = serviceDeliveryFees[service.id];
                  }
                  if (!deliveryFee && service?.serviceId) {
                    deliveryFee = serviceDeliveryFees[service.serviceId];
                  }

                  let distance = serviceDistances[serviceId];
                  if (!distance && service?.id) {
                    distance = serviceDistances[service.id];
                  }
                  if (!distance && service?.serviceId) {
                    distance = serviceDistances[service.serviceId];
                  }

                  const finalDeliveryFee =
                    deliveryFee && ((distance && distance > 0) || !distance)
                      ? deliveryFee
                      : undefined;

                  return (
                    <div
                      key={
                        service.id || service.serviceId || `service-${index}`
                      }
                    >
                      {isCatering &&
                        cateringCalc &&
                        cateringCalc.finalTotal > 0 && (
                          <div className="space-y-3 mb-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                {service.serviceName || service.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {service.vendorName || service.vendor}
                              </span>
                            </div>

                            {cateringCalc.menuItems &&
                              cateringCalc.menuItems.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                  >
                                    <ShoppingBasket className=" w-3 h-3 mr-1" />
                                    Menu items
                                  </Badge>
                                  {cateringCalc.menuItems.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="space-y-1 py-1 border-b border-gray-100 last:border-0"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-800 font-medium">
                                          {item.name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>
                                          {formatCurrency(
                                            item.additionalCharge,
                                          )}{" "}
                                          × {item.quantity}
                                        </span>
                                        <span className="text-orange-600 font-semibold">
                                          {formatCurrency(
                                            item.additionalCharge *
                                              item.quantity,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {cateringCalc.basePriceTotal > 0 && (
                              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  Combo Base Price
                                </span>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-gray-900">
                                    Base Total
                                  </span>
                                  <span className="text-lg font-bold text-orange-600">
                                    {formatCurrency(
                                      cateringCalc.basePriceTotal,
                                    )}
                                  </span>
                                </div>
                              </div>
                            )}

                            {((cateringCalc.comboCards &&
                              cateringCalc.comboCards.length > 0) ||
                              (cateringCalc.simpleItems &&
                                cateringCalc.simpleItems.length > 0) ||
                              (cateringCalc.premiumItems &&
                                cateringCalc.premiumItems.length > 0)) && (
                              <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                                <div className="flex items-center">
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] uppercase tracking-wide bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                  >
                                    <ShoppingBag className="w-3 h-3 mr-1" />
                                    Combo Selected Items
                                  </Badge>
                                </div>

                                {cateringCalc.comboCards &&
                                cateringCalc.comboCards.length > 0 ? (
                                  <div className="grid gap-3">
                                    {cateringCalc.comboCards.map((combo) => (
                                      <div
                                        key={combo.comboId}
                                        className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-semibold text-gray-900 truncate">
                                                {combo.comboName}
                                              </span>
                                              {combo.quantity > 0 && (
                                                <Badge
                                                  variant="outline"
                                                  className="text-[10px] text-gray-700"
                                                >
                                                  {combo.quantity}x
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {combo.simpleItems.length === 0 &&
                                        combo.premiumItems.length === 0 ? (
                                          <p className="text-xs text-gray-500 mt-2">
                                            No items selected for this combo
                                            yet.
                                          </p>
                                        ) : (
                                          <div className="mt-2 space-y-3 ">
                                            {combo.simpleItems.length > 0 && (
                                              <div className="inline-block bg-green-200 rounded-full text-[10px] font-semibold text-gray-500 uppercase px-2 ">
                                                Simple Items
                                              </div>
                                            )}

                                            {combo.simpleItems.map(
                                              (item, idx) => {
                                                const itemTotal =
                                                  item.price * item.quantity;

                                                return (
                                                  <div
                                                    key={
                                                      combo.comboId +
                                                      "-simple-" +
                                                      idx
                                                    }
                                                    className="space-y-1 py-1 border-b border-gray-100 last:border-0"
                                                  >
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-gray-800 font-medium">
                                                        {item.name}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                      <span>
                                                        {formatCurrency(
                                                          item.price,
                                                        )}{" "}
                                                        x {item.quantity}
                                                      </span>
                                                      <span className="text-orange-600 font-semibold">
                                                        {formatCurrency(
                                                          itemTotal,
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )}

                                            {combo.premiumItems.length > 0 && (
                                              <>
                                                <div className="inline-block bg-purple-500 rounded-full text-[10px] text-white font-semibold text-gray-500 uppercase px-2">
                                                  Premium Items
                                                </div>
                                              </>
                                            )}

                                            {combo.premiumItems.map(
                                              (item, idx) => {
                                                const backendPrice =
                                                  item.price || 0;
                                                const upcharge =
                                                  item.additionalCharge || 0;
                                                const greenDisplayPrice =
                                                  backendPrice;
                                                const quantity =
                                                  item.quantity || 1;
                                                const itemTotal =
                                                  (greenDisplayPrice +
                                                    upcharge) *
                                                  quantity;

                                                return (
                                                  <div
                                                    key={
                                                      combo.comboId +
                                                      "-premium-" +
                                                      idx
                                                    }
                                                    className="space-y-1 py-1 border-b border-gray-100 last:border-0"
                                                  >
                                                    <div className="flex justify-between items-center">
                                                      <span className="text-gray-800 font-medium">
                                                        {item.name}
                                                      </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                      <span>
                                                        {formatCurrency(
                                                          greenDisplayPrice,
                                                        )}{" "}
                                                        + (
                                                        {formatCurrency(
                                                          upcharge,
                                                        )}
                                                        ) x {quantity}
                                                      </span>
                                                      <span className="text-orange-600 font-semibold">
                                                        {formatCurrency(
                                                          itemTotal,
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                              <span className="font-semibold text-gray-900">
                                Service Total
                              </span>
                              <span className="text-xl font-bold text-orange-600">
                                {formatCurrency(cateringCalc.finalTotal)}
                              </span>
                            </div>
                          </div>
                        )}

                      {!isCatering && (
                        <ServiceSummaryItem
                          service={service}
                          selectedItems={selectedItems}
                          serviceIndex={index}
                          deliveryFee={finalDeliveryFee}
                        />
                      )}

                      {isCatering &&
                        finalDeliveryFee &&
                        finalDeliveryFee.fee > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700 font-medium">
                                  Delivery Fee
                                </span>
                                {finalDeliveryFee.range && (
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                    {finalDeliveryFee.range}
                                  </span>
                                )}
                              </div>
                              <span className="text-orange-600 font-semibold">
                                +{formatCurrency(finalDeliveryFee.fee)}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(calculations.adjustmentsBreakdown?.length ?? 0) > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Adjustments
              </h4>
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-orange-100">
                {calculations.adjustmentsBreakdown!.map((adj) => (
                  <div
                    key={adj.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-600">{adj.label}</span>
                    <span
                      className={
                        adj.amount < 0
                          ? "text-red-600 font-semibold"
                          : "text-orange-600 font-semibold"
                      }
                    >
                      {adj.amount < 0 ? "" : "+"}
                      {formatCurrency(adj.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalDeliveryFees > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  {(calculations.adjustmentsBreakdown?.length ?? 0) > 0
                    ? "3"
                    : "2"}
                </span>
                Delivery Fees
              </h4>
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-orange-100">
                {Object.entries(serviceDeliveryFees).map(
                  ([serviceId, feeInfo]) => {
                    const service = selectedServices.find(
                      (s) => (s.id || s.serviceId) === serviceId,
                    );

                    let distance = serviceDistances[serviceId];

                    if (!distance && service) {
                      distance =
                        serviceDistances[service.id] ||
                        serviceDistances[service.serviceId];
                    }

                    if (!service || !feeInfo.fee) return null;
                    return (
                      <div
                        key={serviceId}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex-1">
                          <span className="text-gray-800 font-medium block">
                            {service.serviceName || service.name}
                          </span>
                          {feeInfo.range && (
                            <span className="text-orange-600 text-xs font-semibold bg-orange-50 px-2 py-0.5 rounded inline-block mt-1">
                              {feeInfo.range}
                            </span>
                          )}
                        </div>
                        <span className="text-orange-600 font-semibold">
                          {formatCurrency(feeInfo.fee)}
                        </span>
                      </div>
                    );
                  },
                )}
                <Separator className="my-2 bg-orange-200" />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-gray-900">
                    Total Delivery Fees
                  </span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(totalDeliveryFees)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {showDetailedBreakdown && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                  {(() => {
                    let sectionNum = selectedServices.length > 0 ? 2 : 1;
                    if ((calculations.adjustmentsBreakdown?.length ?? 0) > 0)
                      sectionNum++;
                    if (totalDeliveryFees > 0) sectionNum++;
                    return sectionNum;
                  })()}
                </span>
                Fees & Tax
              </h4>
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-orange-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(
                      calculations.subtotal +
                        (calculations.adjustmentsTotal || 0) +
                        totalDeliveryFees,
                    )}
                  </span>
                </div>

                {(calculations.serviceFee > 0 || isServiceFeeWaived) && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-gray-600 ${isServiceFeeWaived ? "line-through" : ""}`}
                      >
                        Service Fee
                      </span>
                      {isServiceFeeWaived && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          WAIVED
                        </Badge>
                      )}
                    </div>
                    <span
                      className={
                        isServiceFeeWaived
                          ? "line-through text-gray-400"
                          : "font-semibold text-gray-900"
                      }
                    >
                      {formatCurrency(
                        isServiceFeeWaived ? 0 : calculations.serviceFee,
                      )}
                    </span>
                  </div>
                )}

                {(calculations.tax > 0 || isTaxExempt) && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        Tax{" "}
                        {calculations.taxData?.rate
                          ? `(${(calculations.taxData.rate * 100).toFixed(1)}%)`
                          : ""}
                      </span>
                      {isTaxExempt && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          EXEMPT
                        </Badge>
                      )}
                    </div>
                    <span
                      className={
                        isTaxExempt
                          ? "text-blue-600 font-semibold"
                          : "font-semibold text-gray-900"
                      }
                    >
                      {isTaxExempt
                        ? "Exempt"
                        : formatCurrency(calculations.tax)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!showDetailedBreakdown && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Subtotal</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(
                    calculations.subtotal +
                      (calculations.adjustmentsTotal || 0) +
                      totalDeliveryFees,
                  )}
                </span>
              </div>

              {showCheckoutTaxNote && calculations.taxData && !isTaxExempt && (
                <div className="text-xs text-gray-500 mt-2">
                  *Tax and fees will be calculated at checkout
                </div>
              )}

              {isTaxExempt && (
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    EXEMPT
                  </Badge>
                  <span>This order is tax exempt</span>
                </div>
              )}
            </div>
          )}

          {showDetailedBreakdown && (
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-5 shadow-lg border-2 border-orange-400">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-lg">TOTAL</span>
                <span className="text-3xl font-bold text-white drop-shadow-md">
                  {formatCurrency(calculations.total)}
                </span>
              </div>
            </div>
          )}

          {showItemCountFooter && totalItemsSelected > 0 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              {totalItemsSelected} total items selected
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

EnhancedOrderSummaryCard.displayName = "EnhancedOrderSummaryCard";

export default EnhancedOrderSummaryCard;
