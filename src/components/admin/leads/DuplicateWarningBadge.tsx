import React, { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { useCheckDuplicates } from "@/hooks/admin/use-leads";
import type { UnifiedEntity } from "@/types/crm-types";

interface DuplicateWarningBadgeProps {
  entity: UnifiedEntity;
}

export function DuplicateWarningBadge({ entity }: DuplicateWarningBadgeProps) {
  const checkDuplicates = useCheckDuplicates();
  const [hasDuplicate, setHasDuplicate] = useState(false);
  const checkedRef = useRef<Set<string>>(new Set());
  const checkingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only check if it's a lead with an email and we haven't checked this email before
    if (entity.type === 'lead' && entity.email && !checkedRef.current.has(entity.email) && !checkingRef.current.has(entity.email)) {
      checkingRef.current.add(entity.email);
      const emailDomain = entity.email.includes('@') ? entity.email.split('@')[1].toLowerCase() : undefined;
      
      checkDuplicates.mutate(
        {
          email: entity.email,
          company_domain: emailDomain
        },
        {
          onSuccess: (result) => {
            checkingRef.current.delete(entity.email);
            checkedRef.current.add(entity.email);
            setHasDuplicate(result.some(r => r.is_user));
          },
          onError: () => {
            checkingRef.current.delete(entity.email);
            checkedRef.current.add(entity.email);
            setHasDuplicate(false);
          }
        }
      );
    }
  }, [entity.email, entity.type, checkDuplicates]);

  if (!hasDuplicate || entity.type !== 'lead') {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className="bg-amber-50 text-amber-700 border-amber-300 flex items-center gap-1 text-xs"
    >
      <AlertTriangle className="h-3 w-3" />
      User Exists
    </Badge>
  );
}