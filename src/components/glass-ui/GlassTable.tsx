import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassTableProps {
  children: ReactNode;
  className?: string;
}

export function GlassTable({ children, className }: GlassTableProps) {
  return (
    <div className={cn(
      'rounded-2xl border border-white/50 backdrop-blur-glass bg-glass-white overflow-hidden',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

export function GlassTableHeader({ children, className }: GlassTableProps) {
  return (
    <thead className={cn('bg-white/30 border-b border-white/50', className)}>
      {children}
    </thead>
  );
}

export function GlassTableBody({ children, className }: GlassTableProps) {
  return (
    <tbody className={cn('divide-y divide-white/30', className)}>
      {children}
    </tbody>
  );
}

export function GlassTableRow({ children, className, ...props }: GlassTableProps & any) {
  return (
    <tr className={cn('transition-colors hover:bg-white/20', className)} {...props}>
      {children}
    </tr>
  );
}

export function GlassTableHead({ children, className }: GlassTableProps) {
  return (
    <th className={cn('px-4 py-3 text-left text-sm font-semibold text-foreground', className)}>
      {children}
    </th>
  );
}

export function GlassTableCell({ children, className }: GlassTableProps) {
  return (
    <td className={cn('px-4 py-3 text-sm text-foreground', className)}>
      {children}
    </td>
  );
}
