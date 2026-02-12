import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileComparisonCardsProps {
  city?: string;
  region?: string;
}

const MobileComparisonCards = ({ city, region }: MobileComparisonCardsProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Prioritize most important features for mobile view
  const allFeatures = [
    {
      feature: "Cross-vendor Coordination",
      ezCater: false,
      peerspace: false,
      instawork: false,
      caterDirectly: "Dedicated coordinator",
    },
    {
      feature: "Single Invoice Checkout",
      ezCater: true,
      peerspace: true,
      instawork: true,
      caterDirectly: "One cart, all services",
    },
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
      feature: "Managed Office Programs",
      ezCater: "Corporate only",
      peerspace: false,
      instawork: false,
      caterDirectly: "Budget + menu planning",
    },
  ];

  // Show only top 4 features on mobile for better focus
  const features = allFeatures.slice(0, 4);

  const renderValue = (value: boolean | string, isOurs?: boolean) => {
    if (typeof value === "string") {
      return (
        <span className={cn(
          "text-sm font-medium",
          isOurs ? "text-success" : "text-muted-foreground"
        )}>
          {value}
        </span>
      );
    }
    if (value) {
      return (
        <div className="flex items-center gap-2">
          <Check className={cn(
            "w-5 h-5",
            isOurs ? "text-success" : "text-muted-foreground"
          )} aria-label="Yes" />
          <span className="text-sm text-muted-foreground">Yes</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <X className="w-5 h-5 text-muted-foreground/30" aria-label="No" />
        <span className="text-sm text-muted-foreground/50">No</span>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {features.map((row, index) => {
        const isExpanded = expandedIndex === index;
        
        return (
          <div
            key={index}
            className="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            {/* Feature Header with Cater Directly Value */}
            <div className="bg-gradient-to-r from-success/10 to-success/5 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="font-semibold text-base text-foreground">
                  {row.feature}
                </h4>
                <div className="flex items-center gap-1.5 text-success shrink-0">
                  {typeof row.caterDirectly === "string" ? (
                    <Check className="w-5 h-5" />
                  ) : row.caterDirectly ? (
                    <Check className="w-5 h-5" />
                  ) : null}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Cater Directly:</span>
                  {renderValue(row.caterDirectly, true)}
                </div>
              </div>
            </div>

            {/* Expandable Competitors Section */}
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/30 transition-colors min-h-[56px]"
              aria-expanded={isExpanded}
              aria-controls={`competitors-${index}`}
            >
              <span className="text-sm font-medium text-muted-foreground">
                Compare competitors
              </span>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            {/* Competitors List */}
            <div
              id={`competitors-${index}`}
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="p-4 space-y-3 bg-muted/5">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-foreground">ezCater</span>
                    {renderValue(row.ezCater)}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm font-medium text-foreground">Peerspace</span>
                    {renderValue(row.peerspace)}
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-foreground">Instawork</span>
                    {renderValue(row.instawork)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileComparisonCards;
