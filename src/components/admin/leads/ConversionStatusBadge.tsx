import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { UnifiedEntity } from "@/types/crm-types";

interface ConversionStatusBadgeProps {
  entity: UnifiedEntity;
}

export function ConversionStatusBadge({ entity }: ConversionStatusBadgeProps) {
  if (entity.type !== 'lead') return null;

  const isConverted = (entity as any).converted_user_id;

  if (!isConverted) return null;

  return (
    <Badge 
      variant="outline" 
      className="bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-1 text-xs"
    >
      <CheckCircle className="h-3 w-3" />
      Converted
    </Badge>
  );
}