import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ContactSoonBadgeProps {
  followupDate: string;
}

export function ContactSoonBadge({ followupDate }: ContactSoonBadgeProps) {
  const timeUntil = formatDistanceToNow(new Date(followupDate), { addSuffix: true });
  
  return (
    <Badge 
      variant="secondary" 
      className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1"
    >
      <Bell className="h-3 w-3" />
      Contact Soon ({timeUntil})
    </Badge>
  );
}