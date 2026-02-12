import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface GuestOrderItem {
  id?: string;
  name?: string;
  image?: string | null;
  price?: number;
  quantity?: number;
}

interface GuestOrder {
  id?: string;
  guestName?: string;
  guestEmail?: string;
  subtotal?: number;
  totalPrice?: number;
  items?: GuestOrderItem[];
}

interface GuestWiseOrderItemsPricingProps {
  guestOrders: GuestOrder[];
  serviceFee?: number;
  taxFee?: number;
  taxRate?: number;
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  serviceFeePercentage?: number;
}

const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

const getGuestSubtotal = (order: GuestOrder) => {
  const fromApi = Number(order.subtotal ?? order.totalPrice ?? 0);
  if (fromApi > 0) return fromApi;
  return (order.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
};

const GuestWiseOrderItemsPricing = ({
  guestOrders,
  serviceFee = 0,
  taxFee = 0,
  taxRate = 0,
  isTaxExempt = false,
  isServiceFeeWaived = false,
  serviceFeePercentage = 5,
}: GuestWiseOrderItemsPricingProps) => {
  const normalizedOrders = (guestOrders || []).map((order) => ({
    ...order,
    computedSubtotal: getGuestSubtotal(order),
  }));

  const guestSubtotalTotal = normalizedOrders.reduce((sum, order) => sum + order.computedSubtotal, 0);
  const grandTotal = guestSubtotalTotal + serviceFee + taxFee;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-gray-200">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
          <span className="font-bold">Order Items & Pricing</span>
          <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800 border border-orange-200">
            Invitated Guests: {guestOrders.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-4">
        {normalizedOrders.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600">
            No guest orders submitted yet.
          </div>
        )}

        {normalizedOrders.map((order) => {
          const guestName = order.guestName || "Guest";
          const guestInitial = guestName.charAt(0).toUpperCase();
          const items = order.items || [];
          const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

          return (
            <div key={order.id || `${guestName}-${order.guestEmail}`} className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-[#F07712] text-white text-xs font-semibold">
                      {guestInitial || "G"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{guestName}</p>
                    <p className="text-xs text-gray-500">{order.guestEmail || "-"}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </Badge>
              </div>

              <Separator />

              <div className="p-4 space-y-2">
                {items.length === 0 && (
                  <p className="text-sm text-gray-500">No items in this order.</p>
                )}
                {items.map((item, idx) => {
                  const qty = Number(item.quantity || 0);
                  const price = Number(item.price || 0);
                  const lineTotal = qty * price;
                  return (
                    <div key={`${item.id || item.name}-${idx}`} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name || "Item"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-500">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 truncate">{item.name || "Item"}</p>
                          <p className="text-xs text-gray-500">
                            {qty} x {formatCurrency(price)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 pb-4">
                <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Guest Subtotal</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatCurrency(order.computedSubtotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {normalizedOrders.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Guests</span>
                <span className="font-medium text-gray-900">{normalizedOrders.length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Guests Subtotal</span>
                <span className="text-base font-semibold text-gray-900">{formatCurrency(guestSubtotalTotal)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-gray-600 ${isServiceFeeWaived ? "line-through" : ""}`}>
                    Service Fee ({serviceFeePercentage}%)
                  </span>
                  {isServiceFeeWaived && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      WAIVED
                    </Badge>
                  )}
                </div>
                <span className={`font-semibold text-gray-900 ${isServiceFeeWaived ? "line-through text-gray-400" : ""}`}>
                  {formatCurrency(serviceFee)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">
                    Tax Fee ({(taxRate * 100).toFixed(3).replace(/\.?0+$/, "")}%)
                  </span>
                  {isTaxExempt && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      TAX EXEMPT
                    </Badge>
                  )}
                </div>
                <span className="font-semibold text-gray-900">{formatCurrency(isTaxExempt ? 0 : taxFee)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-300 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">Grand Total</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestWiseOrderItemsPricing;
