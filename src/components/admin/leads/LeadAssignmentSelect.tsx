import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBackendAdminUsers } from "@/hooks/use-backend-admin-users";
import { User } from "lucide-react";

interface LeadAssignmentSelectProps {
  value: string[] | null;
  onChange: (adminIds: string[]) => void;
  disabled?: boolean;
}

export function LeadAssignmentSelect({ value, onChange, disabled }: LeadAssignmentSelectProps) {
  const { data: backendAdminUsers = [], isLoading } = useBackendAdminUsers();

  // Transform backend admin users to match expected format
  const adminUsers = backendAdminUsers.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    displayName: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.firstName || user.email,
    roles: Array.isArray(user.roles) 
      ? user.roles.map(r => typeof r === 'string' ? r : r.role)
      : []
  }));

  const currentAssignee = value && value.length > 0 ? value[0] : '';
  const assignedUser = adminUsers.find(user => user.id === currentAssignee);
  const displayName = assignedUser?.displayName || assignedUser?.email;

  const handleValueChange = (adminId: string) => {
    if (adminId === 'unassigned') {
      onChange([]);
    } else {
      onChange([adminId]);
    }
  };

  return (
    <Select 
      value={currentAssignee || 'unassigned'} 
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-36 sm:w-40 lg:w-48 h-8 text-xs">
        <SelectValue 
          placeholder={isLoading ? "Loading..." : "Unassigned"}
        >
          {currentAssignee && displayName ? displayName : "Unassigned"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-3 w-3" />
            Unassigned
          </div>
        </SelectItem>
        {adminUsers.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              {user.displayName}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}