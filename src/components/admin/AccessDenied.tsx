import { Lock } from "lucide-react";

export function AccessDenied() {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-center">
        <Lock className="h-16 w-16 mx-auto text-muted-foreground/30" />
        <h2 className="mt-4 text-xl font-semibold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          You don't have permission to access this page. 
          Contact a super-administrator for access.
        </p>
      </div>
    </div>
  );
}
