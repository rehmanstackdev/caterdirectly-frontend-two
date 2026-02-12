
import { forwardRef, ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {}

const Pagination = forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)} {...props} />
  )
);
Pagination.displayName = "Pagination";

const PaginationContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center gap-1 md:gap-2", className)}
      {...props}
    />
  )
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = forwardRef<HTMLButtonElement, PaginationItemProps>(
  ({ className, disabled, onClick, children, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn(
        "h-9 px-3 md:px-4 text-sm",
        disabled ? "pointer-events-none opacity-50" : "",
        className
      )}
      variant={disabled ? "outline" : "secondary"}
      onClick={disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </Button>
  )
);
PaginationItem.displayName = "PaginationItem";

const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationItemProps>(
  (props, ref) => (
    <PaginationItem ref={ref} {...props}>
      {props.children || "Previous"}
    </PaginationItem>
  )
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = forwardRef<HTMLButtonElement, PaginationItemProps>(
  (props, ref) => (
    <PaginationItem ref={ref} {...props}>
      {props.children || "Next"}
    </PaginationItem>
  )
);
PaginationNext.displayName = "PaginationNext";

const PaginationLink = forwardRef<HTMLButtonElement, PaginationItemProps & { isActive?: boolean }>(
  ({ className, isActive, ...props }, ref) => (
    <PaginationItem
      ref={ref}
      className={cn(className, isActive && "bg-primary text-primary-foreground hover:bg-primary/90")}
      {...props}
    />
  )
);
PaginationLink.displayName = "PaginationLink";

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious };
