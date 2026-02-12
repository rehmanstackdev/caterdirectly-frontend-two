import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { LeadStage } from "@/types/crm-types";
import { LEAD_STAGE_INFO } from "@/types/crm-types";

interface LeadStageSelectProps {
  value: LeadStage | null;
  onChange: (stage: LeadStage) => void;
  disabled?: boolean;
}

export function LeadStageSelect({ value, onChange, disabled }: LeadStageSelectProps) {
  return (
    <Select 
      value={value || 'new'} 
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-32 sm:w-36 lg:w-40 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LEAD_STAGE_INFO).map(([stage, info]) => (
          <SelectItem key={stage} value={stage}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${info.color.replace('bg-', 'bg-')}`} />
              {info.displayName}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}