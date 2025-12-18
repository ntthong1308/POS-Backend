import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive table wrapper
 * Converts table to cards on mobile devices
 */
export default function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      {/* Desktop: Show as table */}
      <div className="hidden md:block">
        {children}
      </div>
      
      {/* Mobile: Show as cards (can be implemented later) */}
      <div className="md:hidden">
        {/* For now, just show scrollable table on mobile */}
        <div className="overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
}


