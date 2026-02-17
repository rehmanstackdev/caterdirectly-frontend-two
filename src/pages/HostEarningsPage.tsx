import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/components/dashboard/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import AddGuestService from "@/services/api/host/guest/addguest.service";

type HostEarningsTransaction = {
  id: string;
  guestName: string;
  guestEmail: string;
  eventTitle: string;
  ticketName: string;
  ticketPrice: string;
  commissionAmount: string;
  afterCommissionAmount: string;
  paymentStatus: string;
  hostEarningTransferred: boolean;
  paidAt: string | null;
  createdAt: string;
};

type HostEarningsPayload = {
  totalEarningsGross: number;
  totalEarningsNet: number;
  availableForPayoutGross: number;
  availableForPayoutNet: number;
  pendingEarningsGross: number;
  pendingEarningsNet: number;
  transactions: HostEarningsTransaction[];
  hostCommissionRate: number;
};

const HostEarningsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HostEarningsPayload | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadEarnings = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await AddGuestService.getHostEarnings();
        const payload = result?.data || result;
        if (mounted) {
          setData(payload || null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(
            err?.response?.data?.message || "Failed to load host earnings",
          );
          setData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEarnings();

    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(amount || 0));
  };

  const formatAmountString = (value?: string) => {
    return formatCurrency(Number(value || 0));
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const statusMeta = (status?: string) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "paid") {
      return {
        label: "Paid",
        className: "bg-green-100 text-green-800 border-green-200",
      };
    }

    if (normalized === "payment_intent_created") {
      return {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      };
    }

    return {
      label: status || "Unknown",
      className: "bg-slate-100 text-slate-700 border-slate-200",
    };
  };

  const cards = useMemo(() => {
    return [
      {
        title: "Total Earnings",
        gross: data?.totalEarningsGross ?? 0,
        net: data?.totalEarningsNet ?? 0,
      },
      {
        title: "Available For Payout",
        gross: data?.availableForPayoutGross ?? 0,
        net: data?.availableForPayoutNet ?? 0,
      },
      {
        title: "Pending Earnings",
        gross: data?.pendingEarningsGross ?? 0,
        net: data?.pendingEarningsNet ?? 0,
      },
    ];
  }, [data]);
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = data?.transactions || [];

    if (!query) return rows;

    return rows.filter((t) => {
      const haystack = [
        t.guestName,
        t.guestEmail,
        t.eventTitle,
        t.ticketName,
        t.paymentStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [data?.transactions, searchQuery]);

  return (
    <Dashboard activeTab="earnings" userRole="event-host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Host Earnings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Amounts are shown before commission and after commission.
            </p>
          </div>
          <Button
            onClick={() => navigate("/events/create")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create New Event
          </Button>
        </div>

        {typeof data?.hostCommissionRate === "number" && (
          <div className="text-sm text-slate-600">
            Host Commission Rate:{" "}
            <span className="font-semibold">
              {(data.hostCommissionRate * 100).toFixed(2)}%
            </span>
          </div>
        )}

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Card key={`earnings-skeleton-${idx}`}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-40" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-7 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-10 w-full sm:w-80" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Skeleton
                      key={`tx-skeleton-${idx}`}
                      className="h-12 w-full"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : error ? (
          <Card>
            <CardContent className="py-6 text-red-600">{error}</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card key={card.title}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-xs  tracking-wide text-gray-500">
                        Before Commission
                      </div>
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(card.gross)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs  tracking-wide text-gray-500">
                        After Commission
                      </div>
                      <div className="text-xl font-semibold text-green-700">
                        {formatCurrency(card.net)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Transactions</CardTitle>
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-sm"
                />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[1100px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paid At</TableHead>
                        <TableHead className="text-center">
                          <span className="block">Ticket Price</span>
                          <span className="block text-center text-[11px] text-slate-500">
                            (Before Commission)
                          </span>
                        </TableHead>
                        <TableHead className="text-center">
                          Commission
                        </TableHead>
                        <TableHead className="text-center">
                          <span className="block">Host Earning</span>
                          <span className="block text-center text-[11px] text-slate-500">
                            (After Commission)
                          </span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center text-slate-500 py-8"
                          >
                            No transactions found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.map((t) => {
                          const meta = statusMeta(t.paymentStatus);
                          return (
                            <TableRow key={t.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {t.guestName || "N/A"}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {t.guestEmail || "N/A"}
                                </div>
                              </TableCell>
                              <TableCell>{t.eventTitle || "N/A"}</TableCell>
                              <TableCell>{t.ticketName || "N/A"}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={meta.className}
                                >
                                  {meta.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {formatDate(t.paidAt || t.createdAt)}
                              </TableCell>
                              <TableCell className="text-center">
                                {formatAmountString(t.ticketPrice)}
                              </TableCell>
                              <TableCell className="text-center text-red-600">
                                {formatAmountString(t.commissionAmount)}
                              </TableCell>
                              <TableCell className="text-center font-semibold text-green-700">
                                {formatAmountString(t.afterCommissionAmount)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Dashboard>
  );
};

export default HostEarningsPage;
