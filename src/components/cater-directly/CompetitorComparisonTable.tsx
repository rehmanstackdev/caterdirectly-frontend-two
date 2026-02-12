import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompetitorComparisonTableProps {
  city?: string;
  region?: string;
}

const CompetitorComparisonTable = ({ city, region }: CompetitorComparisonTableProps) => {
  const locationLabel = city ? `${city}${region ? `, ${region}` : ''}` : undefined;

  const features = [
    {
      feature: "Catering Options",
      ezCater: true,
      peerspace: false,
      instawork: false,
      caterDirectly: "All events",
    },
    {
      feature: "Venue Booking",
      ezCater: false,
      peerspace: true,
      instawork: false,
      caterDirectly: "Full coordination",
    },
    {
      feature: "Event Staffing",
      ezCater: false,
      peerspace: false,
      instawork: "Freelance gig workers",
      caterDirectly: "Trained agency staff",
    },
    {
      feature: "Party Rentals",
      ezCater: false,
      peerspace: false,
      instawork: false,
      caterDirectly: "Tables, chairs, linens",
    },
    {
      feature: "Cross-vendor Coordination",
      ezCater: false,
      peerspace: false,
      instawork: false,
      caterDirectly: "Dedicated coordinator",
    },
    {
      feature: "Managed Office Programs",
      ezCater: "Corporate only",
      peerspace: false,
      instawork: false,
      caterDirectly: "Budget + menu planning",
    },
    {
      feature: "Single Invoice Checkout",
      ezCater: true,
      peerspace: true,
      instawork: true,
      caterDirectly: "One cart, all services",
    },
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === "string") {
      return <span className="text-sm text-muted-foreground">{value}</span>;
    }
    if (value) {
      return <Check className="w-5 h-5 text-success mx-auto" aria-label="Yes" />;
    }
    return <X className="w-5 h-5 text-muted-foreground/30 mx-auto" aria-label="No" />;
  };

  const comparisonJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Event Marketplace Platform Comparison",
    "description": "Compare Cater Directly vs ezCater, Peerspace, and Instawork for coordinated event services",
    ...(locationLabel ? { "areaServed": locationLabel } : {}),
    "mainEntity": {
      "@type": "Table",
      "about": "Comparison of event marketplace platforms",
      "caption": "Feature comparison: Cater Directly vs ezCater, Peerspace, and Instawork"
    }
  };

  return (
    <>
      <div className="rounded-lg md:rounded-xl border bg-card shadow-sm overflow-hidden mx-2 sm:mx-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="sticky left-0 z-10 bg-muted/30 shadow-[2px_0_4px_rgba(0,0,0,0.05)] font-semibold text-foreground min-w-[180px] md:min-w-[160px] text-xs sm:text-sm">
                  Feature
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground min-w-[100px] md:min-w-[110px] text-xs sm:text-sm opacity-80">
                  ezCater
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground min-w-[100px] md:min-w-[110px] text-xs sm:text-sm opacity-80">
                  Peerspace
                </TableHead>
                <TableHead className="text-center font-semibold text-foreground min-w-[100px] md:min-w-[110px] text-xs sm:text-sm opacity-80">
                  Instawork
                </TableHead>
                <TableHead className="text-center font-bold text-foreground bg-gradient-to-br from-success/10 to-success/5 min-w-[140px] md:min-w-[150px] text-xs sm:text-sm">
                  Cater Directly
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((row, index) => (
                <TableRow key={index} className="even:bg-muted/20 hover:bg-muted/40 transition-colors">
                  <TableCell className="sticky left-0 z-10 bg-card even:bg-muted/20 shadow-[2px_0_4px_rgba(0,0,0,0.05)] font-medium text-xs sm:text-sm">
                    {row.feature}
                  </TableCell>
                  <TableCell className="text-center text-xs opacity-80 hover:opacity-100 transition-opacity">
                    {renderCell(row.ezCater)}
                  </TableCell>
                  <TableCell className="text-center text-xs opacity-80 hover:opacity-100 transition-opacity">
                    {renderCell(row.peerspace)}
                  </TableCell>
                  <TableCell className="text-center text-xs opacity-80 hover:opacity-100 transition-opacity">
                    {renderCell(row.instawork)}
                  </TableCell>
                  <TableCell className="text-center bg-gradient-to-br from-success/10 to-success/5 text-xs sm:text-sm font-bold">
                    {renderCell(row.caterDirectly)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonJsonLd) }}
      />
    </>
  );
};

export default CompetitorComparisonTable;
