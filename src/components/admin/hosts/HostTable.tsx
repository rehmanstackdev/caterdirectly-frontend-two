import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface HostTableProps {
  loading: boolean;
  filteredHosts: any[];
  updateCommissionRate: (id: string, rate: number) => void;
}

export const HostTable = ({
  loading,
  filteredHosts,
  updateCommissionRate,
}: HostTableProps) => {
  const [commissionRateInputs, setCommissionRateInputs] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const inputs: Record<string, number> = {};
    filteredHosts.forEach((host) => {
      const hostId = host.id;
      const backendValue = host.commissionRate ?? host.commission_rate ?? 0;
      inputs[hostId] = backendValue <= 1 ? backendValue * 100 : backendValue;
    });
    setCommissionRateInputs(inputs);
  }, [filteredHosts]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[220px]">Host</TableHead>
          <TableHead>Host Email</TableHead>
          <TableHead>Email Verified</TableHead>
          <TableHead>Events</TableHead>
          <TableHead>Commission Rate</TableHead>
          {/* Actions column intentionally hidden for now */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-[160px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[220px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-16" />
              </TableCell>
            </TableRow>
          ))
        ) : filteredHosts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10">
              No hosts found.
            </TableCell>
          </TableRow>
        ) : (
          filteredHosts.map((host) => (
            <TableRow key={host.id}>
              <TableCell className="font-medium">{host.name}</TableCell>
              <TableCell>{host.email}</TableCell>
              <TableCell>
                {host.is_verified ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 flex items-center gap-1 w-fit"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <XCircle className="h-3 w-3" /> Unverified
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-semibold">
                  {host.event_count || 0}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={
                      commissionRateInputs[host.id] ??
                      (() => {
                        const backendValue =
                          host.commissionRate ?? host.commission_rate;
                        if (backendValue == null) return 0;
                        return backendValue <= 1
                          ? backendValue * 100
                          : backendValue;
                      })()
                    }
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setCommissionRateInputs((prev) => ({
                        ...prev,
                        [host.id]: value,
                      }));
                    }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      const backendValue =
                        host.commissionRate ?? host.commission_rate ?? 0;
                      const currentPercentage =
                        backendValue <= 1 ? backendValue * 100 : backendValue;

                      if (
                        value !== currentPercentage &&
                        !isNaN(value) &&
                        value >= 0 &&
                        value <= 100
                      ) {
                        updateCommissionRate(host.id, value);
                      } else {
                        setCommissionRateInputs((prev) => ({
                          ...prev,
                          [host.id]: currentPercentage,
                        }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                    }}
                    className="w-20 border rounded px-2 py-1 text-sm"
                    placeholder="0.00"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
